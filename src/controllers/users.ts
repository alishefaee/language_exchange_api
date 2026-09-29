import type { Context } from "hono"
// --- Onboarding Controllers ---
export const getOnboardingState = (c: Context) => {
  return c.json({ test: "Test" })
}

export const updateIdentity = (_c: Context) => {
  // TODO: Implement update identity demographics
}

export const updateLocations = (_c: Context) => {
  // TODO: Implement update locations
}

export const updateLanguages = (_c: Context) => {
  // TODO: Implement update language proficiencies
}

export const getAvatarUploadUrl = (_c: Context) => {
  // TODO: Implement presigned URL generation for avatar
}

export const completeOnboarding = (_c: Context) => {
  // TODO: Implement finalize onboarding and mark profile active
}
