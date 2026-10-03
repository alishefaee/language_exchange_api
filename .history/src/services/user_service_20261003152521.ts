import { User } from "../models/User.ts"
import { Session } from "../models/Session.ts"
import {hashPassword, REFRESH_TOKEN_EXPIRATION_MS, TokenService} from "../helpers/security_helper.ts"
import {generateRandomUsername} from "../helpers/generate_random_username.ts";
import { logger } from "hono/logger"

export class UserService {
  /**
   * Validates uniqueness and creates a new user record.
   */
  static async createUser(data: { email: string; password: string }) {
    const passwordHash = await hashPassword(data.password)

    const user = new User({
      email: data.email,
      username: generateRandomUsername(),
      passwordHash: passwordHash,
      onboardingStep: "identity",
    })

    try {
      await user.save()
      return user
    } catch (error: any) {
      // 11000 is the standard MongoDB error code for a unique index violation
      if (error.name === "MongoServerError" && error.code === 11000) {
        // error.keyPattern will look like { email: 1 } or { username: 1 }
        logger.info(error.keyPattern)
        throw new Error("DUPLICATE_USER")
      }

      // Re-throw any other database errors (e.g., validation failures or connection drops)
      throw error
    }
  }

  /**
   * Retrieves a user by their email address for login verification.
   */
  static async getUserByEmail(email: string) {
    return await User.findOne({ email })
  }

  /**
   * Generates a new refresh token and saves the session to the database.
   */
  static async createSession(userId: string, deviceId?: string): Promise<string> {
    const refreshToken = TokenService.generateRefreshToken() // Returns a secure UUID
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_MS)

    const session = new Session({
      userId,
      refreshToken,
      deviceId,
      expiresAt,
    })

    await session.save()
    return refreshToken
  }

  /**
   * Looks up an active session by its refresh token.
   */
  static async getSession(refreshToken: string) {
    return await Session.findOne({ refreshToken })
  }

  /**
   * Deletes a specific session (used for logout and token rotation).
   */
  static async revokeSession(refreshToken: string) {
    await Session.deleteOne({ refreshToken })
  }

  /**
   * Wipes all active sessions for a user across all devices.
   */
  static async revokeAllUserSessions(userId: string) {
    await Session.deleteMany({ userId })
  }
}
