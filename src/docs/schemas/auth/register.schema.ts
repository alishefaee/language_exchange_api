export const registerSchema = {
  authRegisterSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1001 },
      data: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "6ac9fd2581460a82416fa4aa" },
              email: { type: "string", format: "email", example: "user@example.com" },
              onboardingStep: { type: "string", example: "identity" },
            },
          },
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
  authRegister400: {
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
