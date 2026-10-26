import { z } from "zod"

// Helper regex for validating 24-character MongoDB ObjectIds
const objectIdRegex = /^[0-9a-fA-F]{24}$/
const objectIdSchema = z.string().regex(objectIdRegex, "Invalid ID format.")

// Param validator for routes containing :id
export const idParamSchema = z.object({
  id: objectIdSchema,
})

// Query validator for GET /conversations/
export const getConversationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20).optional(),
})

// Body validator for POST /conversations/
export const createConversationSchema = z.object({
  targetUserId: objectIdSchema,
})

// Query validator for GET /conversations/:id/messages
export const getMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  before: objectIdSchema.optional(), // Cursor-based pagination using message ID
})

// Body validator for POST /conversations/:id/messages
export const sendMessageSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Message text cannot be empty.")
    .max(2000, "Message text cannot exceed 2000 characters."),
})