import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const CONTAINER_HOSTS = new Set(["fakecloud", "host.docker.internal"]);

function assertLocalEndpoint(rawUrl: string): void {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("AWS_ENDPOINT_URL invalido na Lambda");
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (url.protocol !== "http:" || (!LOCAL_HOSTS.has(host) && !CONTAINER_HOSTS.has(host))) {
    throw new Error("AWS_ENDPOINT_URL da Lambda deve apontar para o FakeCloud local");
  }
}

let client: DynamoDBDocumentClient | undefined;

export function getClient(): DynamoDBDocumentClient {
  if (!client) {
    const endpoint = process.env.AWS_ENDPOINT_URL ?? "http://localhost:4566";
    assertLocalEndpoint(endpoint);
    client = DynamoDBDocumentClient.from(
      new DynamoDBClient({
        region: process.env.AWS_REGION ?? "us-east-1",
        endpoint,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
        },
      }),
      { marshallOptions: { removeUndefinedValues: true } }
    );
  }
  return client;
}

export function getTableName(): string {
  const table = process.env.DYNAMODB_TABLE;
  if (!table) throw new Error("DYNAMODB_TABLE nao foi definido na Lambda");
  return table;
}
