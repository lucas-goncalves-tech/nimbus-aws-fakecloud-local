import { describe, expect, it } from "vitest";
import { fileEventSchema } from "../../src/features/files/file-event.dto";

const valid = {
  version: 1,
  fileId: "11111111-1111-1111-1111-111111111111",
  bucket: "nimbus-dev-uploads",
  key: "uploads/abc.mp4",
  etag: "abc123",
  contentType: "video/mp4",
  size: 1024,
  uploadedAt: "2026-11-24T00:00:00.000Z",
};

describe("fileEventSchema", () => {
  it("aceita um evento valido", () => {
    expect(fileEventSchema.parse(valid)).toEqual(valid);
  });

  it("rejeita versao desconhecida", () => {
    expect(fileEventSchema.safeParse({ ...valid, version: 2 }).success).toBe(false);
  });

  it("rejeita tamanho negativo", () => {
    expect(fileEventSchema.safeParse({ ...valid, size: -1 }).success).toBe(false);
  });

  it("rejeita payload sem fileId", () => {
    const withoutId = { ...valid, fileId: undefined };
    expect(fileEventSchema.safeParse(withoutId).success).toBe(false);
  });
});
