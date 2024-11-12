import { and, eq, gt, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { recompensas, users } from "~/server/db/schema";

export const recompensasRouter = createTRPCRouter({
  comprar: protectedProcedure
    .input(z.object({ id: z.number(), price: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const existingReward = await ctx.db
        .select()
        .from(recompensas)
        .where(
          and(
            eq(recompensas.userId, ctx.session!.user!.id),
            eq(recompensas.tipoId, input.id),
            eq(recompensas.precio, 0),
          ),
        );
      const first = existingReward[0];

      if (first) {
        // Update the quantity if the reward already exists
        await ctx.db
          .update(recompensas)
          .set({ quantity: sql`${recompensas.quantity} + ${1}` })
          .where(
            and(
              eq(recompensas.userId, ctx.session!.user!.id),
              eq(recompensas.tipoId, input.id),
              eq(recompensas.precio, 0),
            ),
          );
      } else {
        await ctx.db.insert(recompensas).values({
          userId: ctx.session!.user!.id,
          tipoId: input.id,
          createdById: ctx.session!.user!.id,
          quantity: 1,
          precio: 0,
        });
      }
      await ctx.db
        .update(users)
        .set({ tokens: sql`${users.tokens} - ${input.price}` })
        .where(eq(users.id, ctx.session!.user!.id));
    }),

  setearPrecio: protectedProcedure
    .input(
      z.object({
        tipoId: z.number(),
        precio: z.number(),
        quantity: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existingRewardEnVenta = await ctx.db
        .select()
        .from(recompensas)
        .where(
          and(
            eq(recompensas.userId, ctx.session!.user!.id),
            eq(recompensas.tipoId, input.tipoId),
            gt(recompensas.precio, 0),
          ),
        );
      const first = existingRewardEnVenta[0];

      if (first) {
        // Update the quantity if the reward already exists
        await ctx.db
          .update(recompensas)
          .set({
            quantity: sql`${recompensas.quantity} + ${input.quantity}`,
            precio: input.precio,
          })
          .where(
            and(
              eq(recompensas.userId, ctx.session!.user!.id),
              eq(recompensas.tipoId, input.tipoId),
              gt(recompensas.precio, 0),
            ),
          );
      } else {
        await ctx.db
          .update(recompensas)
          .set({ precio: input.precio })
          .where(
            and(
              eq(recompensas.userId, ctx.session!.user!.id),
              eq(recompensas.tipoId, input.tipoId),
            ),
          );
      }
      const existingReward = await ctx.db
        .select()
        .from(recompensas)
        .where(
          and(
            eq(recompensas.userId, ctx.session!.user!.id),
            eq(recompensas.tipoId, input.tipoId),
            eq(recompensas.precio, 0),
          ),
        );
      const firstR = existingReward[0];
      if (firstR) {
        await ctx.db.delete(recompensas).where(eq(recompensas.id, firstR.id));
      }
    }),

  getAllRecompensas: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      if (input.id) {
        const mts = await ctx.db
          .select()
          .from(recompensas)
          .where(eq(recompensas.userId, input.id));
        return mts ?? [];
      }
      const mts = await ctx.db.select().from(recompensas);
      return mts ?? [];
    }),

  getRecompensasEnVenta: protectedProcedure.query(async ({ ctx, input }) => {
    const mts = await ctx.db
      .select()
      .from(recompensas)
      .where(gt(recompensas.precio, 0));
    return mts ?? [];
  }),
});
