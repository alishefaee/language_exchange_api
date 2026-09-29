import { User } from "../models/User.ts"
import { Session } from "../models/Session.ts"
import { REFRESH_TOKEN_EXPIRATION_MS, TokenService } from "../helpers/security_helper.ts"

export class UserService {
  /**
   * Validates uniqueness and creates a new user record.
   */
  static async createUser(data: { email: string; username: string; passwordHash: string }) {
    const existingUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    }).select("_id")

    if (existingUser) {
      throw new Error("Email or username already exists")
    }

    const user = new User({
      email: data.email,
      username: data.username,
      passwordHash: data.passwordHash,
      onboardingStep: "identity",
    })

    await user.save()
    return user
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
