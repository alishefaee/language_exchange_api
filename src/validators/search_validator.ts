import { z } from "zod"

// Base filter criteria
const searchFilterFields = {
  minAge: z.coerce.number().int().min(13).max(120).optional(),
  maxAge: z.coerce.number().int().min(13).max(120).optional(),
  gender: z.enum(["male", "female", "non-binary", "other", "prefer_not_to_say"]).optional(),
  countryOfOrigin: z.string().min(2).max(3).trim().toUpperCase().optional(),
  countryOfResidence: z.string().min(2).max(3).trim().toUpperCase().optional(),
  nativeLanguage: z.string().min(2).max(3).trim().toLowerCase().optional(),
  learningLanguage: z.string().min(2).max(3).trim().toLowerCase().optional(),
  keywords: z.string().max(100).trim().optional(),
}

// Query validation for GET /search/users
export const executeSearchQuerySchema = z.object({
  ...searchFilterFields,
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
})

// Body validation for POST /search/presets
export const createSavedSearchSchema = z.object({
  name: z.string().min(1, "Search name is required.").max(50).trim(),
  ...searchFilterFields,
})

// Body validation for PATCH /search/presets/:id
export const updateSavedSearchSchema = createSavedSearchSchema.partial()