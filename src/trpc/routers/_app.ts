import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { tasksRouter } from "./tasks";
export const appRouter = createTRPCRouter({
  tasks: tasksRouter,
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
