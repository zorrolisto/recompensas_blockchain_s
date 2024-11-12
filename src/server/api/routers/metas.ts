import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { metas, transactionsM, users } from "~/server/db/schema";

export const metasRouter = createTRPCRouter({
  terminarMeta: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(metas)
        .set({ avance: 100 })
        .where(eq(metas.id, input.id));
    }),
  claimMeta: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(metas)
        .set({ isClaim: true })
        .where(eq(metas.id, input.id));
    }),

  saveMeta: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        avance: z.number(),
        unit: z.string(),
        name: z.string(),
        tokens: z.number(),
        userId: z.string(),
        goal: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        console.log("input.id", input.id);
        await ctx.db
          .update(metas)
          .set({
            name: input.name,
            goal: input.goal,
            unit: input.unit,
            tokens: input.tokens,
            avance: input.avance,
            userId: input.userId,
          })
          .where(eq(metas.id, input.id));
        return;
      }
      console.log(" not input.id", input.id);
      console.log("ctx.session!.user!.id", ctx.session!);
      const userRes = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, ctx.session!.user!.email!));
      console.log("userRes", userRes);
      if (!userRes[0]) {
        throw new Error("User not found");
      }
      const userId = userRes[0].id;
      console.log("userId", userId);
      await ctx.db.insert(metas).values({
        name: input.name,
        goal: input.goal,
        unit: input.unit,
        tokens: input.tokens,
        userId: input.userId,
        avance: input.avance,
        isClaim: false,
        createdById: userId,
      });
    }),

  getAllMetas: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      console.log("input.id", input.id);
      if (input.id) {
        const mts = await ctx.db
          .select({
            id: metas.id,
            name: metas.name,
            goal: metas.goal,
            unit: metas.unit,
            avance: metas.avance,
            tokens: metas.tokens,
            userId: metas.userId,
            isClaim: metas.isClaim,
            createdAt: metas.createdAt,
            hash: transactionsM.hashT,
          })
          .from(metas)
          .leftJoin(transactionsM, eq(metas.id, transactionsM.metaId))
          .where(eq(metas.userId, input.id));
        return mts ?? [];
      }
      const mts = await ctx.db
        .select({
          id: metas.id,
          name: metas.name,
          goal: metas.goal,
          unit: metas.unit,
          avance: metas.avance,
          tokens: metas.tokens,
          isClaim: metas.isClaim,
          userId: metas.userId,
          createdAt: metas.createdAt,
          hash: transactionsM.hashT,
        })
        .from(metas)
        .leftJoin(transactionsM, eq(metas.id, transactionsM.metaId));
      return mts ?? [];
    }),
});
