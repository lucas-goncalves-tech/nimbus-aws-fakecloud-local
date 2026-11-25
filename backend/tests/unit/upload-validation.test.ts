import { Readable, Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { describe, expect, it } from "vitest";
import { createFileValidationTransform } from "../../src/features/upload/upload.service";

async function run(bytes: Buffer, maxBytes: number, allowed: string[]) {
  const { validator, getContentType, getSize } = createFileValidationTransform(maxBytes, allowed);
  const chunks: Buffer[] = [];
  const collector = new Writable({
    write(chunk: Buffer, _enc, next) {
      chunks.push(Buffer.from(chunk));
      next();
    },
  });
  await pipeline(Readable.from([bytes]), validator, collector);
  return { body: Buffer.concat(chunks), contentType: getContentType(), size: getSize() };
}

function mp4Like(): Buffer {
  const header = Buffer.from([0, 0, 0, 24, ...Buffer.from("ftypisom")]);
  return Buffer.concat([header, Buffer.alloc(5000, 7)]);
}

describe("validacao de upload", () => {
  it("aceita video mp4 e detecta o tipo", async () => {
    const result = await run(mp4Like(), 1024 * 1024, ["video/mp4"]);
    expect(result.contentType).toBe("video/mp4");
    expect(result.size).toBeGreaterThan(0);
    expect(result.body.length).toBeGreaterThan(0);
  });

  it("rejeita arquivo acima do limite", async () => {
    await expect(run(mp4Like(), 10, ["video/mp4"])).rejects.toThrow(/Tamanho de arquivo/);
  });

  it("rejeita tipo nao permitido", async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...Buffer.alloc(5000)]);
    await expect(run(png, 1024 * 1024, ["video/mp4"])).rejects.toThrow(/Somente/);
  });
});
