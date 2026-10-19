// src/docs/schemas/search/search-preset-by-id.schemas.ts

const SavedSearchFilterProperties = {
  minAge: { type: "integer", minimum: 13, maximum: 120, example: 20 },
  maxAge: { type: "integer", minimum: 13, maximum: 120, example: 35 },
  gender: {
    type: "string",
    enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
    example: "female",
  },
  countryOfOrigin: { type: "string", minLength: 2, maxLength: 3, example: "BR" },
  countryOfResidence: { type: "string", minLength: 2, maxLength: 3, example: "DE" },
  nativeLanguage: { type: "string", minLength: 2, maxLength: 3, example: "pt" },
  learningLanguage: { type: "string", minLength: 2, maxLength: 3, example: "de" },
  keywords: {
    type: "string",
    maxLength: 100,
    example: "music travel coffee",
    description: "Space-separated keywords to match against user bios",
  },
}

const SavedSearchItem = {
  type: "object",
  properties: {
    _id: { type: "string", example: "6b1f9fd2581460a82416fa99" },
    userId: { type: "string", example: "6ac9fd2581460a82416fa4aa" },
    name: { type: "string", maxLength: 50, example: "German learners in Berlin" },
    ...SavedSearchFilterProperties,
    createdAt: { type: "string", format: "date-time", example: "2026-10-18T12:00:00.000Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-10-18T12:00:00.000Z" },
  },
}

export const searchPresetByIdSchemas = {
  UpdateRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50, example: "Updated Preset Name" },
      ...SavedSearchFilterProperties,
    },
  },
  UpdateResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: { savedSearch: SavedSearchItem },
      },
    },
  },
  DeleteResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: { message: { type: "string", example: "Saved search deleted successfully." } },
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
  Response404: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3002 },
      message: { type: "string", example: "RESOURCE_NOT_FOUND" },
      data: {
        type: "object",
        properties: { message: { type: "string", example: "Saved search not found." } },
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