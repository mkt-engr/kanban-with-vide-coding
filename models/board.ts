import { z } from "zod";
import { ColumnSchema } from "./column";

export const BoardSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().nullable(),
  columns: z.array(ColumnSchema),
});

export type Board = z.infer<typeof BoardSchema>;
