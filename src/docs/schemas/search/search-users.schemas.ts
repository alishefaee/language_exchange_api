// src/docs/schemas/search/search-users.schemas.ts

const LanguageLevel = {
  type: "object",
  properties: {
    languageCode: { type: "string", minLength: 2, maxLength: 3, example: "en" },
    proficiency: {
      type: "string",
      enum: ["beginner", "intermediate", "advanced", "fluent", "native"],
      example: "native",
    },
  },
}

const SearchedUserItem = {
  type: "object",
  properties: {
    _id: { type: "string", example: "6aca2c9a423540e305ec9244" },
    username: { type: "string", example: "user91879756" },
    bio: { type: "string", example: "Love music, travel, and learning languages over coffee!" },
    avatarUrl: { type: "string", format: "uri", nullable: true, example: "https://example.com/avatar.jpg" },
    dateOfBirth: { type: "string", format: "date-time", example: "1998-05-14T00:00:00.000Z" },
    age: { type: "integer", example: 28 },
    gender: {
      type: "string",
      enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
      example: "female",
    },
    religion: { type: "string", nullable: true, example: "agnostic" },
    countryOfOrigin: { type: "string", example: "BR" },
    countryOfResidence: { type: "string", example: "DE" },
    nativeLanguages: { type: "array", items: LanguageLevel },
    learningLanguages: { type: "array", items: LanguageLevel },
    lastLogin: { type: "string", format: "date-time", example: "2026-10-18T11:30:00.000Z" },
    lastUpdatedProfile: { type: "string", format: "date-time", example: "2026-10-15T09:15:00.000Z" },
    onboardingStep: { type: "string", example: "completed" },
  },
}

export const searchUsersSchemas = {
  Response200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          users: { type: "array", items: SearchedUserItem },
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
          gender: ["Invalid enum value. Expected 'male' | 'female' | 'non-binary' | 'other' | 'prefer_not_to_say'"],
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
        properties: { message: { type: "string", example: "Missing or invalid Authorization header" } },
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