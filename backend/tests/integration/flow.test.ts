import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { describe, expect, it } from "vitest";
import { handler } from "../../lambda/index";
import { fileEventSchema } from "../../src/features/files/file-event.dto";

const describeIntegration =
  process.env.RUN_INTEGRATION === "1" ? describe : describe.skip;

function clients() {
  const config = {
    region: process.env.AWS_REGION ?? "us-east-1",
    endpoint: process.env.AWS_ENDPOINT_URL ?? "http://127.0.0.1:4566",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
    },
  };
  const s3 = new S3Client({ ...config, forcePathStyle: true });
  const sqs = new SQSClient(config);
  const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient(config));
  return { s3, sqs, dynamo };
}

describeIntegration("fluxo S3 -> SQS -> Lambda -> DynamoDB", () => {
  it("processa um evento e grava o item como PROCESSED", async () => {
    const { s3, sqs, dynamo } = clients();
    const bucket = process.env.S3_BUCKET!;
    const queueUrl = process.env.SQS_QUEUE_URL!;
    const table = process.env.DYNAMODB_TABLE!;
    const fileId = randomUUID();
    const key = `${process.env.S3_KEY_PREFIX ?? "uploads"}/integration-${fileId}.mp4`;

    const event = fileEventSchema.parse({
      version: 1,
      fileId,
      bucket,
      key,
      etag: "etag-teste",
      contentType: "video/mp4",
      size: 8,
      uploadedAt: new Date().toISOString(),
    });

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: Buffer.from([0, 0, 0, 24, ...Buffer.from("ftypisom")]),
      })
    );
    // O backend criaria este registro PENDING antes de publicar na fila.
    await dynamo.send(
      new PutCommand({
        TableName: table,
        Item: {
          pk: `FILE#${fileId}`,
          sk: "META",
          ...event,
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
      })
    );

    await sqs.send(new SendMessageCommand({ QueueUrl: queueUrl, MessageBody: JSON.stringify(event) }));

    const received = await sqs.send(
      new ReceiveMessageCommand({ QueueUrl: queueUrl, MaxNumberOfMessages: 10, WaitTimeSeconds: 3 })
    );
    const message = received.Messages?.find((item) => item.Body?.includes(fileId));
    expect(message).toBeDefined();

    const result = await handler({
      Records: [{ messageId: message!.MessageId!, body: message!.Body! }],
    });
    expect(result.batchItemFailures).toEqual([]);

    const stored = await dynamo.send(
      new GetCommand({ TableName: table, Key: { pk: `FILE#${fileId}`, sk: "META" } })
    );
    expect(stored.Item?.status).toBe("PROCESSED");

    if (message?.ReceiptHandle) {
      await sqs.send(
        new DeleteMessageCommand({ QueueUrl: queueUrl, ReceiptHandle: message.ReceiptHandle })
      );
    }
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    await dynamo.send(
      new DeleteCommand({ TableName: table, Key: { pk: `FILE#${fileId}`, sk: "META" } })
    );
  });
});
