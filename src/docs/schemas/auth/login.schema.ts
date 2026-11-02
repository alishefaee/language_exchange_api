import { UserResponseItem } from "../common.ts"

export const loginSchema = {
  authLoginSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          user: UserResponseItem,
          access_token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWM5ZmQy...",
          },
          refresh_token: {
            type: "string",
            format: "uuid",
            example: "91e30838-62b4-4957-b6ba-e5dcb0d9a3d0",
          },
          expires_in: { type: "integer", example: 3600 },
          token_type: { type: "string", example: "Bearer" },
        },
      },
    },
  },
  authLogin404: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 2003 },
      message: { type: "string", example: "AUTH_USER_NOT_FOUND" },
    },
  },
}