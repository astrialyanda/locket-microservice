import amqplib from 'amqplib';
import { db } from './db';
import { feeds } from './db/schema';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'; 
const EXCHANGE_NAME = 'locket.events';
const QUEUE_NAME = 'feed-service.post-events';

export async function startConsumer() {
  const connection = await amqplib.connect(RABBITMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'post.*');

  console.log(`Feed Service listening on queue: ${QUEUE_NAME}`);

  channel.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    try {
      const event = JSON.parse(msg.content.toString());
      console.log(`Received event: ${event.event}`, event.data);

      if (event.event === 'post.sent') {
        const { postId, userId, username, content, createdAt } = event.data;

        await db.insert(feeds).values({
          postId,
          userId,
          username,
          content,
          createdAt,
        });

        console.log(`Feed shown for post ID ${postId}`);
      }

      channel.ack(msg);
    } catch (error) {
      console.error('Error processing message:', error);
      channel.nack(msg, false, true);
    }
  });
}
