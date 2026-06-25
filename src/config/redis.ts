import { Redis } from "@upstash/redis";
import "dotenv/config";
export const redis = new Redis({
  url: 'https://sought-puma-81068.upstash.io',
  token: process.env.REDIS_TOKEN,
})
