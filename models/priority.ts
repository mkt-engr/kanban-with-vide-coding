import { z } from "zod";

export const PrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export type Priority = z.infer<typeof PrioritySchema>;
