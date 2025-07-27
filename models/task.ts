import { z } from "zod";
import { prioritySchema } from "./priority";

export const taskSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string().nullable(),
  priority: prioritySchema,
  dueDate: z.date().nullable(),
  isCompleted: z.boolean(),
  position: z.number().int().nonnegative(),
});

export type Task = z.infer<typeof taskSchema>;