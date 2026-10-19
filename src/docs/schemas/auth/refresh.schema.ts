export const refreshSchema = {
  authRefreshSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          access_token: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YWM5ZmQy...",
          },
          refresh_token: {
            type: "string",
            format: "uuid",
            example: "d4f50838-62b4-4957-b6ba-e5dcb0d9a1a2",
          },
          expires_in: { type: "integer", example: 3600 },
          token_type: { type: "string", example: "Bearer" },
        },
      },
    },
  },
  authRefresh400: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3001 },
      message: { type: "string", example: "VALIDATION_FAILED" },
      data: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
        example: {
          refresh_token: ["Refresh token is required."],
        },
      },
    },
  },
  authRefresh401: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 2004 },
      message: { type: "string", example: "AUTH_TOKEN_EXPIRED" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Session expired. Please log in again." },
        },
      },
    },
  },
  authRefresh500: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 5000 },
      message: { type: "string", example: "INTERNAL_ERROR" },
    },
  },
}