import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { transactionsM } from "~/server/db/schema";

export const transactionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        hashT: z.string(),
        metaId: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(transactionsM).values({
        hashT: input.hashT,
        metaId: input.metaId,
      });
    }),
});
