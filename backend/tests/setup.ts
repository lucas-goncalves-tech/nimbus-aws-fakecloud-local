import { resetEnvCache } from "../src/config/env";

process.env.NODE_ENV ??= "test";
process.env.PORT ??= "3333";
process.env.DB_FILE_NAME ??= ":memory:";
process.env.PEPPER ??= "test-pepper";
process.env.ADMIN_EMAIL ??= "admin@admin.com";
process.env.ADMIN_PASSWORD ??= "test-password";
process.env.AWS_REGION ??= "us-east-1";
process.env.AWS_ENDPOINT_URL ??= "http://127.0.0.1:4566";
process.env.AWS_ACCESS_KEY_ID ??= "test";
process.env.AWS_SECRET_ACCESS_KEY ??= "test";
process.env.S3_BUCKET ??= "nimbus-test-uploads";
process.env.SQS_QUEUE_URL ??= "http://127.0.0.1:4566/000000000000/nimbus-test-file-events";
process.env.DYNAMODB_TABLE ??= "nimbus-test-file-records";
process.env.S3_KEY_PREFIX ??= "uploads";
process.env.S3_USE_MULTIPART ??= "false";

resetEnvCache();
