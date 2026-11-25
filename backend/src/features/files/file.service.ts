import { randomUUID } from "node:crypto";
import { envCheck } from "../../shared/helper/env-check.helper";
import { SqsService } from "../../shared/aws/sqs.service";
import { UploadService, type UploadedFile } from "../upload/upload.service";
import { fileEventSchema, type FileEvent } from "./file-event.dto";
import { FileRepository } from "./file.repository";

/**
 * Orquestra o fluxo Nimbus: S3 -> registro PENDING no DynamoDB -> mensagem
 * na SQS. A Lambda consumidora atualiza o registro para PROCESSED.
 */
export class FileService {
  constructor(
    private readonly uploadService: UploadService,
    private readonly repository: FileRepository = new FileRepository(),
    private readonly events: SqsService = new SqsService()
  ) {}

  async upload(stream: NodeJS.ReadableStream, fileName: string): Promise<UploadedFile> {
    const uploaded = await this.uploadService.save(stream, fileName);

    const event: FileEvent = fileEventSchema.parse({
      version: 1,
      fileId: randomUUID(),
      bucket: envCheck().S3_BUCKET,
      key: uploaded.key,
      etag: uploaded.etag,
      contentType: uploaded.contentType,
      size: uploaded.size,
      uploadedAt: new Date().toISOString(),
    });

    await this.repository.createPending(event);

    try {
      await this.events.publish(event);
    } catch (error) {
      // Evita objeto orfao sem rastro: o registro mostra a falha de publicacao.
      await this.repository.markFailed(event.fileId, "FALHA_PUBLICACAO_SQS");
      throw error;
    }

    return uploaded;
  }
}
