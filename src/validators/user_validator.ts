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
  avatarUrl: z.url().optional(),
})

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

export const uploadAvatarSchema = z.object({
  avatar: z
    .instanceof(File, { message: "Avatar file is required." })
    .refine((file) => file.size <= MAX_FILE_SIZE, "Max image size is 5MB.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .webp formats are supported.",
    ),
})