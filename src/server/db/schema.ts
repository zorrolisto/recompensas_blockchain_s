import { sql } from "drizzle-orm";
import { int, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
  (name) => `recompensas_blockchain_${name}`,
);

const defaultFields = {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  createdById: text("created_by", { length: 255 })
    .notNull()
    .references(() => users.id),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
};

export const transactionsM = createTable("transactions_m", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  hashT: text("hash_t", { length: 256 }).notNull(),
  metaId: int("meta_id")
    .notNull()
    .references(() => metas.id),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});

export const users = createTable("user", {
  id: text("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  username: text("username", { length: 255 }).notNull(),
  type: text("type", { length: 20 }).notNull(),
  name: text("name", { length: 255 }),
  email: text("email", { length: 255 }).notNull(),
  password: text("password", { length: 255 }).notNull(),
  tokens: int("tokens").$default(() => 0),
});

export const metas = createTable("meta", {
  ...defaultFields,
  name: text("name", { length: 256 }).notNull(),
  goal: int("goal").notNull(),
  unit: text("unit", { length: 20 }).notNull(),
  tokens: int("tokens"),
  avance: int("avance").notNull(),
  isClaim: int("is_claim", { mode: "boolean" }).notNull(),

  // This is a foreign key reference to the `user` table.
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
});

export const recompensas = createTable("recompensa_usuario", {
  ...defaultFields,
  tipoId: int("tipo_id"),
  quantity: int("quantity").notNull(),

  precio: int("precio").default(0),

  // This is a foreign key reference to the `user` table.
  userId: text("user_id", { length: 255 })
    .notNull()
    .references(() => users.id),
});

export const tiporecompensas = createTable("tipo_recompensa", {
  name: text("name"),
  estado: int("estado"),
  description: text("description"),
  price: int("price").notNull(),
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  createdAt: int("created_at", { mode: "timestamp" })
    .default(sql`(unixepoch())`)
    .notNull(),
});
