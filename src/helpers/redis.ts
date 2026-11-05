// src/helpers/redis.ts
import { Redis } from "ioredis"
import { getLogger } from "@std/log"

const logger = getLogger()
const REDIS_URL = Deno.env.get("REDIS_URL") || "redis://localhost:6379"

export const redis = new Redis(REDIS_URL, {
  lazyConnect: true,
})

redis.on("error", (err) => logger.error(`Redis Error: ${err.message}`))

export const TokenBlacklist = {
  /**
   * Blacklists an access token until its natural expiration time.
   */
  async add(token: string, expTimestampSec: number): Promise<void> {
    const nowSec = Math.floor(Date.now() / 1000)
    const ttlSeconds = expTimestampSec - nowSec

    // Only store in Redis if the token hasn't expired yet
    if (ttlSeconds > 0) {
      await redis.set(`bl:${token}`, "1", "EX", ttlSeconds)
    }
  },

  /**
   * Checks if an access token has been revoked.
   */
  async isBlacklisted(token: string): Promise<boolean> {
    const result = await redis.exists(`bl:${token}`)
    return result === 1
  },
}