// src/helpers/validator.ts
import { zValidator as zv } from "@hono/zod-validator"
import type { ValidationTargets } from "hono"
import type { ZodSchema } from "zod"
import { reply } from "../helpers/api_resp.ts"

export const validate = <
  T extends ZodSchema,
  Target extends keyof ValidationTargets,
>(target: Target, schema: T) => {
  return zv(target, schema, (result, c) => {
    if (!result.success) {
      // Returns a clean object mapping fields to their error messages
      const errors = result.error.flatten().fieldErrors
      return reply.error(c, "VALIDATION_FAILED", errors)
    }
  })
}
