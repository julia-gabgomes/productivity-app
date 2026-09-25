import { z } from "zod";

// Sem "server-only": estes schemas também podem ser usados na validação do formulário no cliente.

export const taskSchema = z.object({
  id: z.uuid(),
  titulo: z.string().trim().min(1, "Título é obrigatório"),
  descricao: z.string().trim().optional(),
  // Date chega intacto ao cliente graças ao transformer superjson (init.ts / client.tsx / query-client.ts).
  dataCriacao: z.date(),
});

export const createTaskInput = taskSchema.pick({
  titulo: true,
  descricao: true,
});

export const updateTaskInput = createTaskInput
  .partial()
  .extend({ id: taskSchema.shape.id });

export const getTaskInput = taskSchema.pick({ id: true });

export const deleteTaskInput = taskSchema.pick({ id: true });

export const listTasksInput = z.object({
  cursor: z.uuid().nullish(),
  limit: z.number().int().min(1).max(50).default(10),
});

export type Task = z.infer<typeof taskSchema>;
export type CreateTaskInput = z.infer<typeof createTaskInput>;
export type UpdateTaskInput = z.infer<typeof updateTaskInput>;
export type ListTasksInput = z.infer<typeof listTasksInput>;
