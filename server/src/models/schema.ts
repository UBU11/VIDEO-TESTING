import {
  integer,
  pgTable,
  varchar,
  uuid,
  timestamp,
  text
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const webSocketDataTable = pgTable("websocket_data", {
  id: uuid("id").primaryKey().defaultRandom(),
  channelId: varchar("channel_id", { length: 255 }).notNull(),
  authToken: varchar("auth_token", { length: 512 }).notNull(),
  message: text("message").notNull(),
  userId:integer().notNull().references(()=>usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
