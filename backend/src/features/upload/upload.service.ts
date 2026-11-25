import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { Readable, Transform, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { Request, Response } from "express";
import { envCheck } from "../../shared/helper/env-check.helper";
import { s3Client } from "../../shared/aws/clients";
import { BadRequestError } from "../../shared/errors/bad-request.error";

export const MAX_BYTES_VIDEO = 500 * 1024 * 1024;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];

export interface UploadedFile {
  /** Chave do objeto no S3. Mantido como `path` por compatibilidade com o LMS. */
  path: string;
  key: string;
  etag: string;
  size: number;
  contentType: string;
  seconds: number;
}

/**
 * Transform de validacao: aceita apenas os MIME types permitidos e limita o
 * tamanho. Exportado para testes unitarios nao precisarem de um bucket.
 */
export function createFileValidationTransform(
  maxBytes = MAX_BYTES_VIDEO,
  allowedTypes: readonly string[] = ALLOWED_VIDEO_TYPES
) {
  let fileSize = 0;
  let detectedType: string | undefined;
  let probe: Buffer | undefined;

  const validator = new Transform({
    transform(chunk: Buffer, _encoding, next) {
      fileSize += chunk.length;
      if (fileSize > maxBytes) {
        next(new BadRequestError(`Tamanho de arquivo ultrapassa os ${maxBytes / (1024 * 1024)}mb`));
        return;
      }

      if (detectedType) {
        next(null, chunk);
        return;
      }

      probe = probe ? Buffer.concat([probe, chunk]) : Buffer.from(chunk);
      if (probe.length < 4096) {
        next(); // retem os primeiros bytes ate conseguir detectar o tipo
        return;
      }

      void fileTypeFromBuffer(probe)
        .then((type) => {
          if (!type || !allowedTypes.includes(type.mime)) {
            next(new BadRequestError(`Somente ${allowedTypes.join(", ")} sao permitidos`));
            return;
          }
          detectedType = type.mime;
          const pending = probe;
          probe = undefined;
          next(null, pending);
        })
        .catch(next);
    },
    flush(next) {
      if (detectedType) {
        next();
        return;
      }
      if (!probe || probe.length === 0) {
        next(new BadRequestError("Nao foi possivel identificar o tipo do arquivo"));
        return;
      }
      void fileTypeFromBuffer(probe)
        .then((type) => {
          if (!type || !allowedTypes.includes(type.mime)) {
            next(new BadRequestError(`Somente ${allowedTypes.join(", ")} sao permitidos`));
            return;
          }
          detectedType = type.mime;
          const pending = probe;
          probe = undefined;
          this.push(pending);
          next();
        })
        .catch(next);
    },
  });

  return {
    validator,
    getContentType: () => detectedType,
    getSize: () => fileSize,
  };
}

export class UploadService {
  private readonly bucket = envCheck().S3_BUCKET;
  private readonly prefix = envCheck().S3_KEY_PREFIX.replace(/^\/+|\/+$/g, "");
  private readonly useMultipart = envCheck().S3_USE_MULTIPART === "true";

  private buildKey(fileName: string): { key: string; contentType: string } {
    const rawExt = path.extname(fileName).toLowerCase();
    const ext = /^\.[a-z0-9]{1,8}$/.test(rawExt) ? rawExt : ".mp4";
    return {
      key: `${this.prefix}/${randomUUID()}${ext}`,
      contentType: ext === ".webm" ? "video/webm" : "video/mp4",
    };
  }

  async save(stream: NodeJS.ReadableStream, fileName: string): Promise<UploadedFile> {
    const { validator, getContentType, getSize } = createFileValidationTransform();
    const { key, contentType: fallbackContentType } = this.buildKey(fileName);

    let etag = "";
    let size = 0;

    if (this.useMultipart) {
      // O Upload consome o Transform; ligamos a requisicao na entrada dele.
      const input = stream as Readable;
      input.on("error", (error) => validator.destroy(error));
      validator.on("error", () => input.destroy());
      input.pipe(validator);

      const result = await new Upload({
        client: s3Client,
        params: {
          Bucket: this.bucket,
          Key: key,
          Body: validator,
          ContentType: fallbackContentType,
        },
        queueSize: 4,
        partSize: 5 * 1024 * 1024,
      }).done();
      etag = result.ETag ?? "";
      size = getSize();
    } else {
      const chunks: Buffer[] = [];
      const collector = new Writable({
        write(chunk: Buffer, _encoding, next) {
          chunks.push(Buffer.from(chunk));
          next();
        },
      });
      await pipeline(stream as Readable, validator, collector);
      const body = Buffer.concat(chunks);
      size = body.length;
      const result = await s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: body,
          ContentType: getContentType() ?? fallbackContentType,
        })
      );
      etag = result.ETag ?? "";
    }

    return {
      path: key,
      key,
      etag: etag.replace(/^"|"$/g, ""),
      size,
      contentType: getContentType() ?? fallbackContentType,
      // O probe de duracao (ffprobe) saiu do caminho de upload; o cliente
      // informa `seconds` ao criar a aula. Ver docs/backend-contract.md.
      seconds: 0,
    };
  }

  async rm(key: string): Promise<void> {
    if (!key.startsWith(`${this.prefix}/`)) {
      throw new BadRequestError("Chave do objeto invalida");
    }
    await s3Client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
  }

  async fileExist(key: string | null): Promise<boolean> {
    if (!key) return false;
    try {
      await s3Client.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }

  async streamingVideo(key: string, req: Request, res: Response, mimeType = "video"): Promise<void> {
    if (!(await this.fileExist(key))) {
      throw new BadRequestError("Arquivo de video nao encontrado no servidor.");
    }

    const object = await s3Client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Range: req.headers.range,
      })
    );

    if (!object.Body) {
      throw new BadRequestError("Objeto sem conteudo");
    }

    res.status(object.ContentRange ? 206 : 200);
    res.setHeader("Accept-Ranges", "bytes");
    if (object.ContentType) res.setHeader("Content-Type", object.ContentType);
    else res.setHeader("Content-Type", mimeType);
    if (object.ContentLength) res.setHeader("Content-Length", object.ContentLength);
    if (object.ContentRange) res.setHeader("Content-Range", object.ContentRange);

    await pipeline(object.Body as Readable, res);
  }
}
