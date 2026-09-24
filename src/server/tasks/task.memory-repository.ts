import "server-only";
import { TaskNotFoundError } from "./task.errors";
import type { TaskRepository } from "./task.repository";
import type { Task } from "./task.schema";

// Singleton em globalThis: sobrevive ao HMR em dev e garante que o route handler
// (/api/trpc) e o SSR (server.tsx) compartilhem a mesma instância do Map.
const globalForTasks = globalThis as unknown as {
  taskStore?: Map<string, Task>;
};

const taskStore = globalForTasks.taskStore ?? createStore();
globalForTasks.taskStore = taskStore;

function createStore() {
  const store = new Map<string, Task>();
  if (process.env.NODE_ENV === "development") seed(store);
  return store;
}

// Dados iniciais em dev para exercitar o infinite scroll.
function seed(store: Map<string, Task>) {
  const now = Date.now();
  for (let i = 1; i <= 50; i++) {
    const task: Task = {
      id: crypto.randomUUID(),
      titulo: `Tarefa ${i}`,
      descricao: i % 3 === 0 ? undefined : `Descrição da tarefa ${i}`,
      dataCriacao: new Date(now - (50 - i) * 60_000),
    };
    store.set(task.id, task);
  }
}

// Cópias evitam que quem consome o repositório altere o store diretamente.
// O Date também é copiado, pois é um objeto mutável.
const clone = (task: Task): Task => ({
  ...task,
  dataCriacao: new Date(task.dataCriacao),
});

export const memoryTaskRepository: TaskRepository = {
  create({ titulo, descricao }) {
    const task: Task = {
      id: crypto.randomUUID(),
      titulo,
      descricao,
      dataCriacao: new Date(),
    };
    taskStore.set(task.id, task);
    return clone(task);
  },

  list({ cursor, limit }) {
    // Mais recentes primeiro; desempate por id para uma ordem estável.
    const all = [...taskStore.values()].sort(
      (a, b) =>
        b.dataCriacao.getTime() - a.dataCriacao.getTime() ||
        b.id.localeCompare(a.id),
    );

    // Paginação por cursor (id do último item da página anterior), resistente a remoções.
    let start = 0;
    if (cursor) {
      const index = all.findIndex((task) => task.id === cursor);
      // Cursor removido entre as requisições: não há como saber a posição, então encerra a lista.
      if (index === -1) return { items: [], nextCursor: null };
      start = index + 1;
    }

    const items = all.slice(start, start + limit).map(clone);
    const hasMore = start + limit < all.length;
    return { items, nextCursor: hasMore ? items[items.length - 1].id : null };
  },

  findById(id) {
    const task = taskStore.get(id);
    return task ? clone(task) : null;
  },

  update({ id, ...changes }) {
    const current = taskStore.get(id);
    if (!current) throw new TaskNotFoundError(id);

    const updated: Task = {
      ...current,
      ...(changes.titulo !== undefined && { titulo: changes.titulo }),
      ...(changes.descricao !== undefined && { descricao: changes.descricao }),
    };
    taskStore.set(id, updated);
    return clone(updated);
  },

  delete(id) {
    if (!taskStore.delete(id)) throw new TaskNotFoundError(id);
  },
};
