// src/config/bullmq.ts
// BullMQ bundles its own ioredis. Passing a top-level IORedis instance causes
// structural type incompatibility between the two ioredis versions.
// Solution: pass a plain ConnectionOptions object — BullMQ builds its own client.
import { Queue } from 'bullmq';
import type { ConnectionOptions } from 'bullmq';
import 'dotenv/config';

export const redisConnectionOptions: ConnectionOptions = {
  host: process.env.AIVEN_REDIS_HOST,
  port: Number(process.env.AIVEN_REDIS_PORT) || 6379,
  password: process.env.AIVEN_REDIS_PASSWORD,
  username: process.env.AIVEN_REDIS_USERNAME ?? 'default',
  tls: {},              // required for Aiven — they enforce TLS
  maxRetriesPerRequest: null, // required by BullMQ
};

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 1000,
  },
  removeOnComplete: { count: 1000 },
  removeOnFail: { count: 5000 },
};

export const dispatchQueue = new Queue('dispatch', {
  connection: redisConnectionOptions,
  defaultJobOptions,
});

export const timeoutQueue = new Queue('timeout', {
  connection: redisConnectionOptions,
  defaultJobOptions,
});
