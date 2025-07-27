import { z } from "zod";

export const prioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export type Priority = z.infer<typeof prioritySchema>;
