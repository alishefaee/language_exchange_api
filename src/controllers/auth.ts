import type { Context } from "hono"
import { UserService } from "../services/auth_service.ts"
import { TokenService, verifyPassword } from "../helpers/security_helper.ts"
import { reply } from "../helpers/api_resp.ts"
import { getLogger } from "@std/log"
import { AppEnv } from "../types/index.d.ts"

const logger = getLogger()
// --- Auth Controllers ---
export const register = async (c: Context) => {
  try {
    const { email, password } = await c.req.json<any>()

    // The service returns pure data, completely unaware of HTTP
    const user = await UserService.createUser({ email, password })

    const deviceId = c.req.header("user-agent")
    const accessToken = await TokenService.generateAccessToken(user.id)
    const refreshToken = await UserService.createSession(user.id, deviceId)

    // The controller formats the pure data into the ApiResponse structure
    return reply.success(c, "CREATED", {
      user: {
        id: user.id,
        email: user.email,
        onboardingStep: user.onboardingStep,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      token_type: "Bearer",
    })
  } catch (error: any) {
    // 1. Handle expected business errors thrown by the Service
    if (error.message === "DUPLICATE_USER") {
      return reply.error(c, "BAD_REQUEST", {
        message: "This email is already registered.",
      })
    }

    // 2. Handle unexpected fatal errors (Database offline, syntax errors, etc.)
    logger.error(error.message)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json<any>()

    // Retrieve the user from the database by email
    const user = await UserService.getUserByEmail(email)
    if (!user) {
      return reply.error(c, "AUTH_USER_NOT_FOUND")
    }

    // Verify the incoming plain-text password against the stored bcrypt hash
    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return reply.error(c, "AUTH_USER_NOT_FOUND")
    }

    const deviceId = c.req.header("user-agent")
    const accessToken = await TokenService.generateAccessToken(user.id)
    const refreshToken = await UserService.createSession(user.id, deviceId)

    return reply.success(c, "OK", {
      user: {
        id: user.id,
        email: user.email,
        onboardingStep: user.onboardingStep,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      token_type: "Bearer",
    })
  } catch (error: any) {
    logger.error(error.message)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const refresh = async (c: Context) => {
  try {
    // Extracted safely via Zod validation middleware
    const { refresh_token } = await c.req.json()

    // 1. Verify token exists in the database
    const session = await UserService.getSession(refresh_token)

    // 2. Reject if session is missing (deleted via TTL or revoked) or expired manually
    if (!session || session.expiresAt.getTime() < Date.now()) {
      if (session) await UserService.revokeSession(refresh_token)
      return reply.error(c, "AUTH_TOKEN_EXPIRED", {
        message: "Session expired. Please log in again.",
      })
    }

    // 3. ROTATION: Revoke the old token so it cannot be used again
    await UserService.revokeSession(refresh_token)

    // 4. Issue a completely new pair, resetting the 90-day clock
    const newRefreshToken = await UserService.createSession(
      session.userId.toString(),
      session.deviceId,
    )
    const newAccessToken = await TokenService.generateAccessToken(session.userId.toString())

    return reply.success(c, "OK", {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 3600,
      token_type: "Bearer",
    })
  } catch (error: any) {
    logger.error(`Refresh Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const logout = async (c: Context) => {
  try {
    // Extract safely parsed token from the Zod validation middleware
    const { refresh_token } = await c.req.json<any>()

    if (refresh_token) {
      // If the token is already expired/deleted by the TTL index,
      // Mongoose silently handles it without throwing an error.
      await UserService.revokeSession(refresh_token)
    }

    return reply.success(c, "OK", {
      message: "Successfully logged out of current device",
    })
  } catch (error: any) {
    // This block only catches genuine fatal errors (e.g., database connection loss)
    logger.error(`Logout Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const logoutAllDevices = async (c: Context<AppEnv>) => {
  try {
    // Extracted from the Hono context, injected previously by the requireAuth middleware
    const jwtPayload = c.get("jwtPayload")
    const userId = jwtPayload?.sub

    if (!userId) {
      return reply.error(c, "UNAUTHORIZED")
    }

    await UserService.revokeAllUserSessions(userId)

    return reply.success(c, "OK", {
      message: "Successfully logged out of all devices",
    })
  } catch (error: any) {
    logger.error(`Logout All Devices Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}
