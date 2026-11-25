import { GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { documentClient } from "../../shared/aws/clients";
import { envCheck } from "../../shared/helper/env-check.helper";
import type { FileEvent } from "./file-event.dto";

export type FileStatus = "PENDING" | "PROCESSED" | "FAILED";

export interface FileRecord {
  fileId: string;
  status: FileStatus;
  bucket: string;
  key: string;
  etag: string;
  size: number;
  contentType: string;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  error?: string;
}

export const fileKey = (fileId: string) => ({ pk: `FILE#${fileId}`, sk: "META" });

export function isConditionalCheckFailed(error: unknown): boolean {
  return (
    error instanceof ConditionalCheckFailedException ||
    (typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "ConditionalCheckFailedException")
  );
}

/** Repository de escrita/leitura do registro de processamento. */
export class FileRepository {
  private readonly table = envCheck().DYNAMODB_TABLE;

  async createPending(event: FileEvent): Promise<void> {
    const now = new Date().toISOString();
    await documentClient.send(
      new PutCommand({
        TableName: this.table,
        Item: {
          ...fileKey(event.fileId),
          fileId: event.fileId,
          status: "PENDING" as const,
          bucket: event.bucket,
          key: event.key,
          etag: event.etag,
          size: event.size,
          contentType: event.contentType,
          uploadedAt: event.uploadedAt,
          createdAt: now,
          updatedAt: now,
        },
        ConditionExpression: "attribute_not_exists(pk) AND attribute_not_exists(sk)",
      })
    );
  }

  async markFailed(fileId: string, reason: string): Promise<void> {
    await documentClient.send(
      new UpdateCommand({
        TableName: this.table,
        Key: fileKey(fileId),
        UpdateExpression: "SET #status = :failed, error = :reason, updatedAt = :now",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
          ":failed": "FAILED" as const,
          ":reason": reason,
          ":now": new Date().toISOString(),
        },
      })
    );
  }

  async findById(fileId: string): Promise<FileRecord | null> {
    const result = await documentClient.send(
      new GetCommand({ TableName: this.table, Key: fileKey(fileId) })
    );
    return (result.Item as FileRecord | undefined) ?? null;
  }
}
