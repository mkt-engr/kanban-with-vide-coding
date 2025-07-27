import { z } from "zod";
import { PrioritySchema } from "./priority";

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().nullable(),
  priority: PrioritySchema,
  dueDate: z.date().nullable(),
  isCompleted: z.boolean(),
  position: z.number().int("位置は整数である必要があります"),
});

export type Task = z.infer<typeof TaskSchema>;
