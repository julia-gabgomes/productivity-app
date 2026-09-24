import type {
  CreateTaskInput,
  ListTasksInput,
  Task,
  UpdateTaskInput,
} from "./task.schema";

export type TaskPage = {
  items: Task[];
  nextCursor: string | null;
};

// Contrato de acesso aos dados: trocar a memória por um banco exige apenas outra implementação.
export interface TaskRepository {
  create(input: CreateTaskInput): Task;
  list(params: {
    cursor?: string | null;
    limit: ListTasksInput["limit"];
  }): TaskPage;
  findById(id: string): Task | null;
  /** @throws {TaskNotFoundError} */
  update(input: UpdateTaskInput): Task;
  /** @throws {TaskNotFoundError} */
  delete(id: string): void;
}
