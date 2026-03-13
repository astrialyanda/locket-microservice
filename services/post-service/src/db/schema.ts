import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';
 
export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  username: varchar('username', { length: 50 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at'). defaultNow().notNull(),
});
