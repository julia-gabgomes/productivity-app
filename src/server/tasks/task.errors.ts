export class TaskNotFoundError extends Error {
  constructor(public readonly id: string) {
    super(`Tarefa com id "${id}" não encontrada`);
    this.name = "TaskNotFoundError";
  }
}
