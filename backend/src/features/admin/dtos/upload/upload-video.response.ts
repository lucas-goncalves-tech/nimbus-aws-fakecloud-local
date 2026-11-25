import z from "zod";

export const uploadVideoResponse = z.object({
  /** Chave do objeto no S3 (compatibilidade com o cliente do LMS). */
  path: z.string(),
  key: z.string(),
  etag: z.string(),
  size: z.number(),
  contentType: z.string(),
  seconds: z.number(),
});

export const uploadVideoHeaders = z.object({
  "x-filename": z.string(),
});
