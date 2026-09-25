import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { memoryTaskRepository } from "../server/tasks/task.memory-repository";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  return { userId: "user_123", taskRepository: memoryTaskRepository };
};

const t = initTRPC
  .context<Awaited<ReturnType<typeof createTRPCContext>>>()
  .create({ transformer: superjson });

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;
