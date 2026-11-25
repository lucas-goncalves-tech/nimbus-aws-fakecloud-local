import "dotenv/config";
import { z } from "zod";

/**
 * Configuracao central do backend.
 *
 * Toda integracao com "AWS" e local: o endpoint precisa apontar para o
 * FakeCloud. A validacao abaixo impede que uma variavel mal copiada aponte
 * o backend para uma conta AWS real por acidente.
 */
const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3333),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Persistencia do dominio LMS (fora do fluxo S3 -> SQS -> Lambda).
  DB_FILE_NAME: z.string().min(1).default("./data/lms.sqlite"),
  PEPPER: z.string().min(1),
  ADMIN_EMAIL: z.string().min(1),
  ADMIN_PASSWORD: z.string().min(1),
  FRONTEND_URL: z.string().min(1).default("http://localhost:3001"),
  OPENAPI_URL: z.string().min(1).default("http://localhost:3333/api/v1"),

  // FakeCloud / fluxo Nimbus.
  AWS_REGION: z.string().min(1).default("us-east-1"),
  AWS_ENDPOINT_URL: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1).default("test"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1).default("test"),
  S3_BUCKET: z.string().min(1),
  SQS_QUEUE_URL: z.string().min(1),
  DYNAMODB_TABLE: z.string().min(1),
  S3_KEY_PREFIX: z.string().min(1).default("uploads"),
  S3_USE_MULTIPART: z.enum(["true", "false"]).default("true"),
});

export type Env = z.infer<typeof envSchema>;

/** Hosts permitidos para o emulador. Hostnames de container so em dev/test. */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const CONTAINER_HOSTS = new Set(["fakecloud", "host.docker.internal"]);

function assertLocalEndpoint(rawUrl: string, nodeEnv: Env["NODE_ENV"]): void {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("AWS_ENDPOINT_URL nao e uma URL valida");
  }

  if (url.protocol !== "http:") {
    throw new Error("AWS_ENDPOINT_URL deve usar http:// (FakeCloud local)");
  }

  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const isLocal = LOCAL_HOSTS.has(host);
  const isContainerDev =
    nodeEnv !== "production" && CONTAINER_HOSTS.has(host);

  if (!isLocal && !isContainerDev) {
    throw new Error(
      `AWS_ENDPOINT_URL deve apontar para o FakeCloud local (localhost/127.0.0.1); recebido: ${host}`
    );
  }
}

let cached: Env | undefined;

export function envCheck(): Env {
  if (!cached) {
    const parsed = envSchema.parse(process.env);
    assertLocalEndpoint(parsed.AWS_ENDPOINT_URL, parsed.NODE_ENV);
    cached = parsed;
  }
  return cached;
}

/** Utilizado pelos testes para trocar o ambiente entre casos. */
export function resetEnvCache(): void {
  cached = undefined;
}
