/**
 * Remove objetos e registros de teste do FakeCloud.
 * Uso: npm run cleanup
 */
import { DeleteObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  DynamoDBDocumentClient,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";

const config = {
  region: process.env.AWS_REGION ?? "us-east-1",
  endpoint: process.env.AWS_ENDPOINT_URL ?? "http://127.0.0.1:4566",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "test",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "test",
  },
};

const bucket = process.env.S3_BUCKET ?? "nimbus-dev-uploads";
const table = process.env.DYNAMODB_TABLE ?? "nimbus-dev-file-records";
const prefix = process.env.S3_KEY_PREFIX ?? "uploads";

const s3 = new S3Client({ ...config, forcePathStyle: true });
const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient(config));

let continued;
do {
  const listed = await s3.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: `${prefix}/`, ContinuationToken: continued })
  );
  for (const object of listed.Contents ?? []) {
    if (!object.Key) continue;
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: object.Key }));
    console.log(`objeto removido: ${object.Key}`);
  }
  continued = listed.IsTruncated ? listed.NextContinuationToken : undefined;
} while (continued);

let lastKey;
do {
  const scanned = await dynamo.send(
    new ScanCommand({
      TableName: table,
      FilterExpression: "begins_with(pk, :prefix)",
      ExpressionAttributeValues: { ":prefix": "FILE#" },
      ExclusiveStartKey: lastKey,
    })
  );
  for (const item of scanned.Items ?? []) {
    await dynamo.send(
      new DeleteCommand({ TableName: table, Key: { pk: item.pk, sk: item.sk } })
    );
    console.log(`registro removido: ${item.pk}`);
  }
  lastKey = scanned.LastEvaluatedKey;
} while (lastKey);

console.log("Limpeza concluida.");
