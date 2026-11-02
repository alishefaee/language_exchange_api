import { UserResponseItem } from "../common.ts"

export const registerSchema = {
  RegisterRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: {
        type: "string",
        format: "password",
        minLength: 8,
        example: "securepassword123",
      },
    },
  },
  RegisterResponse201: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1001 },
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
  RegisterResponse400: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3000 },
      message: { type: "string", example: "BAD_REQUEST" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "This email is already registered." },
        },
      },
    },
  },
}