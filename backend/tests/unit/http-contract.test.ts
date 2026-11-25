import request from "supertest";
import { describe, expect, it } from "vitest";
import { App } from "../../src/app";

describe("contrato HTTP", () => {
  const app = new App(":memory:").app;

  it("expõe liveness sem depender do emulador", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("devolve erro no formato { code, message, requestId }", async () => {
    const response = await request(app).get("/api/v1/rota-inexistente");
    expect(response.status).toBe(404);
    expect(response.body.code).toBe("NOT_FOUND");
    expect(typeof response.body.message).toBe("string");
    expect(response.body.requestId).toBe(response.headers["x-request-id"]);
  });

  it("rejeita token na query string", async () => {
    const response = await request(app).get("/api/v1/files/abc?token=qualquer");
    expect(response.status).toBe(401);
    expect(response.body.code).toBe("UNAUTHORIZED");
  });
});
