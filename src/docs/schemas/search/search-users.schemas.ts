// Inside src/docs/schemas/search/search-users.schemas.ts:
import { UserResponseItem } from "../common.ts"

export const searchUsersSchemas = {
  SearchUsersResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          users: {
            type: "array",
            items: UserResponseItem, // Full user records with _id, email, blockedUsers, etc.
          },
          pagination: {
            type: "object",
            properties: {
              total: { type: "integer", example: 42 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              totalPages: { type: "integer", example: 3 },
            },
          },
        },
      },
    },
  },
  Response400: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3001 },
      message: { type: "string", example: "VALIDATION_FAILED" },
      data: {
        type: "object",
        additionalProperties: { type: "array", items: { type: "string" } },
        example: {
          minAge: ["Number must be greater than or equal to 13"],
          gender: [
            "Invalid enum value. Expected 'male' | 'female' | 'non-binary' | 'other' | 'prefer_not_to_say'",
          ],
        },
      },
    },
  },
  Response401: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 2000 },
      message: { type: "string", example: "UNAUTHORIZED" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Missing or invalid Authorization header" },
        },
      },
    },
  },
  Response500: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 5000 },
      message: { type: "string", example: "INTERNAL_ERROR" },
    },
  },
}
