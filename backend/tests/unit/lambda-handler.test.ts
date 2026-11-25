import { describe, expect, it, vi } from "vitest";
import {
  AlreadyProcessedError,
  type FileRecordRepository,
} from "../../lambda/repository";
import { createHandler } from "../../lambda/index";

const body = JSON.stringify({
  version: 1,
  fileId: "file-1",
  bucket: "bucket",
  key: "uploads/file-1.mp4",
  etag: "etag",
  contentType: "video/mp4",
  size: 10,
  uploadedAt: "2026-11-24T00:00:00.000Z",
});

const record = (messageId: string, payload = body) => ({ messageId, body: payload });

describe("handler da Lambda", () => {
  it("processa mensagem valida sem falhas de lote", async () => {
    const repository: FileRecordRepository = {
      markProcessed: vi.fn().mockResolvedValue("processed"),
    };
    const result = await createHandler(repository)({ Records: [record("m1")] });
    expect(result).toEqual({ batchItemFailures: [] });
    expect(repository.markProcessed).toHaveBeenCalledWith("file-1");
  });

  it("devolve falha parcial para payload invalido", async () => {
    const repository: FileRecordRepository = {
      markProcessed: vi.fn().mockResolvedValue("processed"),
    };
    const result = await createHandler(repository)({
      Records: [record("m1", "{"), record("m2")],
    });
    expect(result.batchItemFailures).toEqual([{ itemIdentifier: "m1" }]);
    expect(repository.markProcessed).toHaveBeenCalledTimes(1);
  });

  it("trata entrega duplicada como sucesso (idempotencia)", async () => {
    const repository: FileRecordRepository = {
      markProcessed: vi.fn().mockRejectedValue(new AlreadyProcessedError()),
    };
    const result = await createHandler(repository)({ Records: [record("m1")] });
    expect(result.batchItemFailures).toEqual([]);
  });

  it("envia erro do repositorio para batchItemFailures", async () => {
    const repository: FileRecordRepository = {
      markProcessed: vi.fn().mockRejectedValue(new Error("DynamoDB indisponivel")),
    };
    const result = await createHandler(repository)({ Records: [record("m1")] });
    expect(result.batchItemFailures).toEqual([{ itemIdentifier: "m1" }]);
  });
});
