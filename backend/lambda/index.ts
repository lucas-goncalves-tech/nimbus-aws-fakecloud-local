import { fileEventSchema } from "./event.schema";
import { AlreadyProcessedError, DynamoFileRecordRepository, type FileRecordRepository } from "./repository";

export interface SqsRecordLike {
  messageId: string;
  body: string;
}

export interface SqsEventLike {
  Records: SqsRecordLike[];
}

export interface BatchResult {
  batchItemFailures: { itemIdentifier: string }[];
}

/**
 * Handler com injecao de dependencia para testes unitarios.
 * O event source mapping deve habilitar ReportBatchItemFailures (Issue 012).
 */
export function createHandler(repository: FileRecordRepository) {
  return async (event: SqsEventLike): Promise<BatchResult> => {
    const batchItemFailures: BatchResult["batchItemFailures"] = [];

    for (const record of event.Records ?? []) {
      try {
        let payload: unknown;
        try {
          payload = JSON.parse(record.body);
        } catch {
          throw new Error("Payload nao e JSON valido");
        }

        const parsed = fileEventSchema.safeParse(payload);
        if (!parsed.success) throw new Error("Payload fora do contrato");

        await repository.markProcessed(parsed.data.fileId);
      } catch (error) {
        if (error instanceof AlreadyProcessedError) continue;
        batchItemFailures.push({ itemIdentifier: record.messageId });
      }
    }

    return { batchItemFailures };
  };
}

export const handler = createHandler(new DynamoFileRecordRepository());
