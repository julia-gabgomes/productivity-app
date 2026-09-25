import { TRPCError } from "@trpc/server";
import { TaskNotFoundError } from "../../server/tasks/task.errors";
import {
  createTaskInput,
  deleteTaskInput,
  getTaskInput,
  listTasksInput,
  updateTaskInput,
} from "../../server/tasks/task.schema";
import { baseProcedure, createTRPCRouter } from "../init";

function toTRPCError(error: unknown): never {
  if (error instanceof TaskNotFoundError) {
    throw new TRPCError({ code: "NOT_FOUND", message: error.message });
  }
  throw error;
}

export const tasksRouter = createTRPCRouter({
  list: baseProcedure
    .input(listTasksInput)
    .query(({ ctx, input }) => ctx.taskRepository.list(input)),

  byId: baseProcedure.input(getTaskInput).query(({ ctx, input }) => {
    const task = ctx.taskRepository.findById(input.id);
    if (!task) toTRPCError(new TaskNotFoundError(input.id));
    return task;
  }),

  create: baseProcedure
    .input(createTaskInput)
    .mutation(({ ctx, input }) => ctx.taskRepository.create(input)),

  update: baseProcedure.input(updateTaskInput).mutation(({ ctx, input }) => {
    try {
      return ctx.taskRepository.update(input);
    } catch (error) {
      toTRPCError(error);
    }
  }),

  delete: baseProcedure.input(deleteTaskInput).mutation(({ ctx, input }) => {
    try {
      ctx.taskRepository.delete(input.id);
      return { success: true, id: input.id };
    } catch (error) {
      toTRPCError(error);
    }
  }),
});
