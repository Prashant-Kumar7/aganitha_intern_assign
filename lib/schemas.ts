import { z } from "zod";

export const createPasteSchema = z.object({
  content: z.string().min(1, "Content is required and must be a non-empty string"),
  ttl_seconds: z.number().int().min(1).optional(),
  max_views: z.number().int().min(1).optional(),
});

export type CreatePasteInput = z.infer<typeof createPasteSchema>;
