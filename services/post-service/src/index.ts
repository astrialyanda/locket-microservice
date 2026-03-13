import { Elysia, t } from 'elysia';
import { db } from './db';
import { posts } from './db/schema';
import { eq, sql } from 'drizzle-orm';
import { publishEvent } from './events';

const app = new Elysia()
  .post('/api/posts/send', async ({ body }) => {
    const [post] = await db.insert(posts).values({
      userId: body.userId,
      username: body.username,
      content: body.content,
    }).returning();
    if (!post) {
      return new Response(JSON.stringify({ error: 'Failed to send post' }), { status: 500 });
    }

    await publishEvent('post.sent', {
        postId: post.id,
        userId: post.userId,
        username: post.username,
        content: post.content,
        createdAt: post.createdAt,
    })

    return new Response(JSON.stringify(post), { status: 201 });
  }, {
    body: t.Object({
        userId: t.String({ format: 'uuid'}),
        username: t.String(),
        content: t.String(),
    })
  }
  )
  .get('/api/posts/show/:userId', async ({ params }) => {
    const results = await db.select().from(posts).where(eq(posts.userId, params.userId));
    if (!results[0]) {
      return new Response(JSON.stringify({ error: 'This user has no post!' }), { status: 404 });
    }
    return results[0];
  })
  .get('/health', () => ({ status: 'ok', service: 'post-service' }))
  .listen(3001);

console.log(`Post Service running on port ${app.server?.port}`);