export const commonSchemas = {
  ApiResponseSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: { type: "object" },
    },
  },
  ApiResponseError: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3000 },
      message: { type: "string", example: "BAD_REQUEST" },
      data: { type: "object" },
    },
  },
}
