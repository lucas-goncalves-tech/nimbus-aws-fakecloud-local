import { SendMessageCommand } from "@aws-sdk/client-sqs";
import type { FileEvent } from "../../features/files/file-event.dto";
import { envCheck } from "../../config/env";
import { sqsClient } from "./clients";

export class SqsService {
  async publish(event: FileEvent): Promise<void> {
    await sqsClient.send(
      new SendMessageCommand({
        QueueUrl: envCheck().SQS_QUEUE_URL,
        MessageBody: JSON.stringify(event),
        MessageAttributes: {
          version: { DataType: "Number", StringValue: String(event.version) },
        },
      })
    );
  }
}
