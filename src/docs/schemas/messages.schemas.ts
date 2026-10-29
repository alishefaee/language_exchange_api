export const messageSchemas = {
  DeleteMessageSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Message permanently deleted." },
        },
      },
    },
  },

  ValidationError400: {
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
          id: ["Invalid ID format."],
        },
      },
    },
  },

  Unauthorized401: {
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

  ForbiddenSender403: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 2001 },
      message: { type: "string", example: "FORBIDDEN" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "You can only delete your own messages." },
        },
      },
    },
  },

  MessageNotFound404: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3002 },
      message: { type: "string", example: "RESOURCE_NOT_FOUND" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Message not found." },
        },
      },
    },
  },

  InternalError500: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 5000 },
      message: { type: "string", example: "INTERNAL_ERROR" },
    },
  },
}