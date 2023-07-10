import { z as schema } from "zod";

export const TodoSchema = schema.object({
  id: schema.string().uuid(),
  content: schema.string(),
  date: schema.string().transform((date) => new Date(date).toISOString()),
  done: schema.boolean(),
});

export type Todo = schema.infer<typeof TodoSchema>;
