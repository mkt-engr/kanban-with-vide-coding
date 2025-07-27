import { z } from "zod";
import { columnSchema } from "./column";

export const boardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  columns: z.array(columnSchema),
});

export type Board = z.infer<typeof boardSchema>;