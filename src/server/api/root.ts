import { metasRouter } from "~/server/api/routers/metas";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { transactionsRouter } from "./routers/trans";
import { usersRouter } from "./routers/user";
import { recompensasRouter } from "./routers/recom";
import { tipoRecompensasRouter } from "./routers/tiporecom";

export const appRouter = createTRPCRouter({
  metas: metasRouter,
  transactions: transactionsRouter,
  users: usersRouter,
  recompensas: recompensasRouter,
  tiporecompensas: tipoRecompensasRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
