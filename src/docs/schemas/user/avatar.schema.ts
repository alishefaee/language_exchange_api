export const avatarSchema = {
  UploadAvatarRequest: {
    type: "object",
    required: ["avatar"],
    properties: {
      avatar: {
        type: "string",
        format: "binary",
        description: "Avatar image file (.jpg, .jpeg, .png, or .webp, max 5MB).",
      },
    },
  },

  UploadAvatarResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          avatarUrl: {
            type: "string",
            format: "uri",
            example: "http://localhost:8000/api/v1/uploads/avatars/6aca2c9a423540e305ec9244_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.jpg",
          },
          avatarUri: {
            type: "string",
            format: "uri",
            example: "http://localhost:8000/api/v1/uploads/avatars/6aca2c9a423540e305ec9244_9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d.jpg",
          },
        },
      },
    },
  },

  UploadAvatarResponse400: {
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
          avatar: [
            "Max image size is 5MB.",
            "Only .jpg, .jpeg, .png, and .webp formats are supported.",
          ],
        },
      },
    },
  },

  UploadAvatarResponse401: {
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

  UploadAvatarResponse404: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3002 },
      message: { type: "string", example: "RESOURCE_NOT_FOUND" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "User account no longer exists." },
        },
      },
    },
  },

  UploadAvatarResponse500: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 5000 },
      message: { type: "string", example: "INTERNAL_ERROR" },
    },
  },
}