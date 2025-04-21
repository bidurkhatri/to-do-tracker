import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import tasksListRoute from "./routes/tasks/list/route";
import categoriesListRoute from "./routes/categories/list/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  tasks: createTRPCRouter({
    list: tasksListRoute,
  }),
  categories: createTRPCRouter({
    list: categoriesListRoute,
  }),
});

export type AppRouter = typeof appRouter;