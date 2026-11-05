import type { Context, Next } from "hono"
import { TokenService } from "../helpers/security_helper.ts"
import { TokenBlacklist } from "../helpers/redis.ts"
import { reply } from "../helpers/api_resp.ts"
import type { AppEnv } from "../types/index.ts"

export const requireAuth = async (c: Context<AppEnv>, next: Next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.error(c, "UNAUTHORIZED", { message: "Missing or invalid Authorization header" })
  }

  const token = authHeader.split(" ")[1]

  // 1. Verify cryptographic signature and expiration in memory first (free & fast)
  const decodedPayload = await TokenService.verifyAccessToken(token)
  if (!decodedPayload || !decodedPayload.sub) {
    return reply.error(c, "AUTH_TOKEN_EXPIRED", { message: "Access token expired or invalid" })
  }

  // 2. Check Redis denylist to ensure the token wasn't logged out
  const isRevoked = await TokenBlacklist.isBlacklisted(token)
  if (isRevoked) {
    return reply.error(c, "AUTH_TOKEN_EXPIRED", { message: "Access token has been revoked" })
  }

  c.set("jwtPayload", decodedPayload)
  await next()
}