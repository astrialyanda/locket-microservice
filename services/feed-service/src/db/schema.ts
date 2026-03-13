import { pgTable, uuid, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const feeds = pgTable("feeds", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull(),
  userId: uuid("user_id").notNull(),
  username: varchar('username', { length: 50 }).notNull(), 
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull(),
});