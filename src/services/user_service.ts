import { User } from "../models/User.ts"

export class UserService {
  static async completeProfile(userId: string, profileData: any) {
    const updatePayload = {
      ...profileData,
      onboardingStep: "completed",
      lastUpdatedProfile: new Date(), // Activates the user in search queries
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatePayload },
      { new: true, runValidators: true },
    )

    if (!updatedUser) {
      throw new Error("USER_NOT_FOUND")
    }

    return updatedUser
  }

  static async updateAvatar(userId: string, avatarUrl: string) {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatarUrl,
          lastUpdatedProfile: new Date(),
        },
      },
      { new: true, runValidators: true },
    )

    if (!updatedUser) {
      throw new Error("USER_NOT_FOUND")
    }

    return updatedUser
  }
}
