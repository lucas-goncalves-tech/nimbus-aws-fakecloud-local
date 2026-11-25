import z from "zod";
import { registry } from "../../doc/openapi.registry";
import { unauthorizedResponse } from "../../doc/errors/errors";

registry.registerPath({
  path: "/files/{id}",
  method: "get",
  tags: ["Files"],
  summary: "Consulta o status de processamento de um arquivo",
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      description: "Registro encontrado",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              fileId: { type: "string" },
              status: { type: "string", enum: ["PENDING", "PROCESSED", "FAILED"] },
            },
          },
        },
      },
    },
    ...unauthorizedResponse,
  },
});
