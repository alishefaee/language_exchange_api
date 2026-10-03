import type { Context } from "hono"
import { UserService } from "../services/user_service.ts"
import { hashPassword, TokenService, verifyPassword } from "../helpers/security_helper.ts"
import {reply} from "../helpers/api_resp.ts";
import {ApiStatus} from "../helpers/api_status.ts";
import { getLogger } from "@std/log"

const logger = getLogger()
// --- Auth Controllers ---
export const register = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { email, password } = body

    const user = await UserService.createUser({
      email,
      password,
    })

    const deviceId = c.req.header("user-agent")
    const accessToken = await TokenService.generateAccessToken(user.id)
    const refreshToken = await UserService.createSession(user.id, deviceId)

    return reply.success(c, "CREATED",{
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

export const login = async (c: Context) => {
  try {
    const body = await c.req.json()
    const { email, password } = body

    if (!email || !password) {
      return reply.error(c, "EMAIL_AND_PASSWORD_REQUIRED")
    }

    // Retrieve the user from the database by email
    const user = await UserService.getUserByEmail(email)
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401)
    }

    // Verify the incoming plain-text password against the stored bcrypt hash
    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return c.json({ error: "Invalid credentials" }, 401)
    }

    const deviceId = c.req.header("user-agent")
    const accessToken = TokenService.generateAccessToken(user.id)
    const refreshToken = await UserService.createSession(user.id, deviceId)

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        onboardingStep: user.onboardingStep,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 3600,
      token_type: "Bearer",
    }, 200)
  } catch (_error: any) {
    return c.json({ error: "Internal Server Error" }, 500)
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
