import { Redis, RedisOptions } from 'ioredis';

const options: RedisOptions = {
  maxRetriesPerRequest: null
};

export const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', options);
