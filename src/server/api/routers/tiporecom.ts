import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { recompensas, tiporecompensas, users } from "~/server/db/schema";

export const tipoRecompensasRouter = createTRPCRouter({
  saveTipoRecompensa: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string(),
        estado: z.number(),
        description: z.string(),
        price: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("input", input);
      if (input.id) {
        console.log("input.id", input.id);
        await ctx.db
          .update(tiporecompensas)
          .set({
            name: input.name,
            description: input.description,
            estado: input.estado,
            price: input.price,
          })
          .where(eq(tiporecompensas.id, input.id));
        return;
      }
      await ctx.db.insert(tiporecompensas).values({
        name: input.name,
        description: input.description,
        estado: input.estado,
        price: input.price,
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(tiporecompensas)
        .where(eq(tiporecompensas.id, input.id));
    }),
  getAllTipoRecompensas: protectedProcedure.query(async ({ ctx }) => {
    const mts = await ctx.db.select().from(tiporecompensas);
    return mts ?? [];
  }),
});
