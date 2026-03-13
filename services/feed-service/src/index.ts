import { Elysia } from 'elysia';
import { db } from './db';
import { startConsumer } from './consumer';
import { feeds } from './db/schema';
import { desc } from 'drizzle-orm';

const app = new Elysia()
  .get('api/feeds/show', async () => {
    const results = await db.select().from(feeds).orderBy(desc(feeds.createdAt)).limit(50);

    return {
      feeds: results
    };
  })
  .get('/health', () => ({ status: 'ok', service: 'feed-service' }))
  .listen(3002);

startConsumer().catch(console.error);

console.log(`Feed Service running on port ${app.server?.port}`);
