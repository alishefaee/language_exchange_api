import { z } from "zod"

const languageLevelSchema = z.object({
  languageCode: z.string().min(2).max(3).trim().toLowerCase(),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "fluent", "native"]),
})

export const onboardingProfileSchema = z.object({
  dateOfBirth: z.coerce.date().optional(),
  gender: z.enum(["male", "female", "non-binary", "other", "prefer_not_to_say"]).optional(),
  religion: z.string().trim().optional(),
  countryOfOrigin: z.string().min(2).max(3).toUpperCase().optional(),
  countryOfResidence: z.string().min(2).max(3).toUpperCase().optional(),
  nativeLanguages: z.array(languageLevelSchema).optional(),
  learningLanguages: z.array(languageLevelSchema).optional(),
  bio: z.string().max(300).trim().optional(),
  avatarUrl: z.string().url().optional(),
})
