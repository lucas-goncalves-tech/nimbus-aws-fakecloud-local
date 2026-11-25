import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { envCheck } from "../../config/env";

function connectionConfig() {
  const env = envCheck();
  return {
    region: env.AWS_REGION,
    endpoint: env.AWS_ENDPOINT_URL,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  };
}

/** S3 precisa de path-style para funcionar contra emuladores locais. */
export const s3Client = new S3Client({ ...connectionConfig(), forcePathStyle: true });

export const sqsClient = new SQSClient(connectionConfig());

export const dynamoDbClient = new DynamoDBClient(connectionConfig());

export const documentClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: { removeUndefinedValues: true },
});
