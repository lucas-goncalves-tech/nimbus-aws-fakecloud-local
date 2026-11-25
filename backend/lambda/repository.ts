import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getClient, getTableName } from "./config";

export class AlreadyProcessedError extends Error {
  constructor() {
    super("Registro ja processado");
  }
}

function isConditionalFailure(error: unknown): boolean {
  return (
    error instanceof ConditionalCheckFailedException ||
    (typeof error === "object" && error !== null && "name" in error &&
      error.name === "ConditionalCheckFailedException")
  );
}

export interface FileRecordRepository {
  /** Retorna "processed" ou "already_processed". */
  markProcessed(fileId: string): Promise<"processed" | "already_processed">;
}

export class DynamoFileRecordRepository implements FileRecordRepository {
  async markProcessed(fileId: string): Promise<"processed" | "already_processed"> {
    const key = { pk: `FILE#${fileId}`, sk: "META" };
    const now = new Date().toISOString();

    try {
      await getClient().send(
        new UpdateCommand({
          TableName: getTableName(),
          Key: key,
          UpdateExpression: "SET #status = :processed, processedAt = :now, updatedAt = :now",
          ConditionExpression: "#status = :pending",
          ExpressionAttributeNames: { "#status": "status" },
          ExpressionAttributeValues: {
            ":processed": "PROCESSED",
            ":pending": "PENDING",
            ":now": now,
          },
        })
      );
      return "processed";
    } catch (error) {
      if (!isConditionalFailure(error)) throw error;

      const current = await getClient().send(
        new GetCommand({ TableName: getTableName(), Key: key })
      );
      if (current.Item?.status === "PROCESSED") {
        return "already_processed"; // entrega duplicada da SQS: no-op
      }
      throw new Error("Registro nao estava PENDING"); // vai para a DLQ
    }
  }
}
