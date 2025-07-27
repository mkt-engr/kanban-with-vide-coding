import { z } from "zod";
import { taskSchema } from "./task";

export const columnSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  color: z.string(),
  position: z.number().int().nonnegative(),
  tasks: z.array(taskSchema),
});

export type Column = z.infer<typeof columnSchema>;