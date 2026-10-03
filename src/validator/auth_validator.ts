// src/validators/auth.validator.ts
import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Invalid email format.").trim().toLowerCase(),
  password: z.string().min(8, "Password must be at least 8 characters long."),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email format.").trim().toLowerCase(),
  password: z.string().min(1, "Password is required."),
})

export const tokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required."),
})
