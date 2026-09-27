import type { Context } from "hono";
// --- Onboarding Controllers ---
export const getOnboardingState = async (c: Context) => {
    return c.json({test: "Test"})
};

export const updateIdentity = async (c: Context) => {
    // TODO: Implement update identity demographics
};

export const updateLocations = async (c: Context) => {
    // TODO: Implement update locations
};

export const updateLanguages = async (c: Context) => {
    // TODO: Implement update language proficiencies
};

export const getAvatarUploadUrl = async (c: Context) => {
    // TODO: Implement presigned URL generation for avatar
};

export const completeOnboarding = async (c: Context) => {
    // TODO: Implement finalize onboarding and mark profile active
};