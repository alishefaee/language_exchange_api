import type { Context, Next } from "hono"
import { TokenService } from "../helpers/security_helper.ts"
import { reply } from "../helpers/api_resp.ts"

export const requireAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization")

  if (!authHeader) {
    return reply.error(c, "UNAUTHORIZED", { message: "Missing or invalid Authorization header" })
  }

  const token = authHeader.split(" ")[1]
  const decodedPayload = await TokenService.verifyAccessToken(token)

  if (!decodedPayload) {
    // Triggered if the token signature is tampered with or if the 1-hour expiration has passed
    return reply.error(c, "AUTH_TOKEN_EXPIRED", { message: "Access token expired or invalid" })
  }

  if (!decodedPayload.sub) {
    return reply.error(c, "UNAUTHORIZED", { message: "Invalid token payload" })
  }

  // Store the payload in Hono's context so controllers can access the userId
  c.set("jwtPayload", decodedPayload)

  await next()
}
