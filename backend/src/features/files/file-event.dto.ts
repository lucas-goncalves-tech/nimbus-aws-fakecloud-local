import { z } from "zod";

/**
 * Contrato da mensagem publicada na SQS. A mesma definicao e usada pela
 * Lambda (backend/lambda) para validar o payload antes de gravar no DynamoDB.
 */
export const fileEventSchema = z.object({
  version: z.literal(1),
  fileId: z.string().min(1).max(128),
  bucket: z.string().min(1),
  key: z.string().min(1),
  etag: z.string(),
  contentType: z.string(),
  size: z.number().int().nonnegative(),
  uploadedAt: z.string().min(1),
});

export type FileEvent = z.infer<typeof fileEventSchema>;
