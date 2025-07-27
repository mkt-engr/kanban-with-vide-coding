import { z } from "zod";
import { TaskSchema } from "./task";

export const ColumnSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "タイトルは必須です"),
  color: z
    .string()
    .regex(
      /^#[0-9A-Fa-f]{6}$/,
      "カラーは有効なHEXカラーコードである必要があります"
    ),
  position: z.number().int("位置は整数である必要があります"),
  tasks: z.array(TaskSchema),
});

export type Column = z.infer<typeof ColumnSchema>;
