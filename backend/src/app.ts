import { HeadBucketCommand } from "@aws-sdk/client-s3";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { GetQueueAttributesCommand } from "@aws-sdk/client-sqs";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { errorHandler } from "./shared/middlewares/error.middleware";
import { DataBase } from "./db";
import { MainRoutes } from "./route";
import { NotfoundError } from "./shared/errors/not-found.error";
import { rateLimitMiddleware } from "./shared/middlewares/rate-limit.middleware";
import { logMiddleware } from "./shared/middlewares/log.middleware";
import { requestIdMiddleware } from "./shared/middlewares/request-id.middleware";
import { apiReference } from "@scalar/express-api-reference";
import { generateOpenAPISpec } from "./doc/openapi.generator";
import { CleanUpSessionsExpiresJob } from "./jobs/cleanup-sessions-expires.job";
import { dynamoDbClient, s3Client, sqsClient } from "./shared/aws/clients";
import { envCheck } from "./shared/helper/env-check.helper";

class App {
  public readonly app: express.Express;
  private readonly mainRoutes: MainRoutes;
  public readonly db: DataBase;
  public readonly cleanupSessionsExpires: CleanUpSessionsExpiresJob;
  private readonly ttl: number;

  constructor(dbPath?: string) {
    this.app = express();
    this.db = new DataBase(dbPath);
    this.cleanupSessionsExpires = new CleanUpSessionsExpiresJob(this.db);
    this.mainRoutes = new MainRoutes(this.db);
    this.ttl = 15 * 60 * 1000;
    this.init();
  }

  private jobs() {
    // Em testes nao ha schema SQLite aplicado; evitar job desnecessario.
    if (envCheck().NODE_ENV !== "test") {
      this.cleanupSessionsExpires.start();
    }
  }

  private docs() {
    this.app.use(
      "/api-docs",
      apiReference({
        theme: "deepSpace",
        content: generateOpenAPISpec(),
      })
    );
  }

  /** Liveness nao depende do emulador; readiness verifica S3, SQS e DynamoDB. */
  private health() {
    this.app.get("/health", (_req, res) => {
      res.status(200).json({ status: "ok" });
    });

    this.app.get("/ready", async (_req, res) => {
      const env = envCheck();
      const checks: Record<string, "ok" | "error"> = {
        s3: "ok",
        sqs: "ok",
        dynamodb: "ok",
      };

      try {
        await s3Client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
      } catch {
        checks.s3 = "error";
      }
      try {
        await sqsClient.send(
          new GetQueueAttributesCommand({
            QueueUrl: env.SQS_QUEUE_URL,
            AttributeNames: ["QueueArn"],
          })
        );
      } catch {
        checks.sqs = "error";
      }
      try {
        await dynamoDbClient.send(new DescribeTableCommand({ TableName: env.DYNAMODB_TABLE }));
      } catch {
        checks.dynamodb = "error";
      }

      const ready = Object.values(checks).every((value) => value === "ok");
      res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "not_ready",
        checks,
      });
    });
  }

  private middlewares() {
    this.app.use(
      cors({
        origin: envCheck().FRONTEND_URL,
        credentials: true,
      })
    );
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" },
      })
    );
    this.app.use(requestIdMiddleware);
    this.app.use(rateLimitMiddleware(this.ttl, 100, false));
    this.app.use(express.json({ limit: "1mb" }));
    this.app.use(logMiddleware);
  }

  private routes() {
    this.app.use("/api/v1", this.mainRoutes.getRouter);
    this.app.use((_req, _res, next) => {
      next(new NotfoundError("Endpoint não encontrado"));
    });
  }

  private handlers() {
    this.app.use(errorHandler);
  }

  private init() {
    this.jobs();
    this.health();
    this.docs();
    this.middlewares();
    this.routes();
    this.handlers();
  }
}

export { App };
