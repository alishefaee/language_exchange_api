import type { Context } from "hono"
import { UserService } from "../services/user_service.ts"
import { TokenService, verifyPassword } from "../helpers/security_helper.ts"
import {reply} from "../helpers/api_resp.ts";
import { getLogger } from "@std/log"

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
        message: "This email is already registered." 
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
  } catch (_error: any) {
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const refresh = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { refresh_token } = body

    if (!refresh_token) {
      return c.json({ error: "Refresh token is required" }, 400)
    }

    // 1. Verify token exists in the database
    const session = await UserService.getSession(refresh_token)

    // 2. Check if token is invalid or expired (3 months passed with no activity)
    if (!session || session.expiresAt < Date.now()) {
      if (session) await UserService.revokeSession(refresh_token) // Clean up expired token
      return c.json({ error: "Session expired. Please log in again." }, 401)
    }

    // 3. ROTATION: Revoke the old token so it cannot be used again
    await UserService.revokeSession(refresh_token)

    // 4. Issue a completely new pair, resetting the 90-day clock
    const newRefreshToken = await UserService.createSession(session.userId, session.deviceId)
    const newAccessToken = await TokenService.generateAccessToken(session.userId)

    return c.json({
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
      expires_in: 3600,
      token_type: "Bearer",
    }, 200)
  } catch (_error: any) {
    return c.json({ error: "Internal Server Error" }, 500)
  }
}

export const logout = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { refresh_token } = body

    if (refresh_token) {
      await UserService.revokeSession(refresh_token)
    }

    return c.json({ message: "Successfully logged out of current device" }, 200)
  } catch (_error: any) {
    return c.json({ error: "Internal Server Error" }, 500)
  }
}

export const logoutAllDevices = async (c: Context) => {
  try {
    // In a real app, userId is extracted from the validated access token via middleware
    const userId = c.get("jwtPayload")?.sub

    if (!userId) {
      return c.json({ error: "Unauthorized" }, 401)
    }

    await UserService.revokeAllUserSessions(userId)

    return c.json({ message: "Successfully logged out of all devices" }, 200)
  } catch (_error: any) {
    return c.json({ error: "Internal Server Error" }, 500)
  }
}
