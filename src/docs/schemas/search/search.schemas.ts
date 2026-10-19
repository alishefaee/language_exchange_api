// src/docs/schemas/search/search.schemas.ts

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
    nativeLanguages: {
      type: "array",
      items: LanguageLevel,
    },
    learningLanguages: {
      type: "array",
      items: LanguageLevel,
    },
    lastLogin: { type: "string", format: "date-time", example: "2026-10-18T11:30:00.000Z" },
    lastUpdatedProfile: { type: "string", format: "date-time", example: "2026-10-15T09:15:00.000Z" },
    onboardingStep: { type: "string", example: "completed" },
  },
}

export const searchSchemas = {
  // --- Request Schemas ---
  CreateSavedSearchRequest: {
    type: "object",
    required: ["name"],
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50, example: "German learners in Berlin" },
      ...SavedSearchFilterProperties,
    },
  },

  UpdateSavedSearchRequest: {
    type: "object",
    properties: {
      name: { type: "string", minLength: 1, maxLength: 50, example: "Updated Preset Name" },
      ...SavedSearchFilterProperties,
    },
  },

  // --- Success Response Schemas ---
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
            items: SearchedUserItem,
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

  SavedSearchResponse201: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1001 },
      data: {
        type: "object",
        properties: {
          savedSearch: SavedSearchItem,
        },
      },
    },
  },

  SavedSearchResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          savedSearch: SavedSearchItem,
        },
      },
    },
  },

  SavedSearchListResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          savedSearches: {
            type: "array",
            items: SavedSearchItem,
          },
        },
      },
    },
  },

  DeleteSavedSearchResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Saved search deleted successfully." },
        },
      },
    },
  },

  // --- Error Response Schemas ---
  SearchResponse400: {
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
          minAge: ["Number must be greater than or equal to 13"],
          gender: ["Invalid enum value. Expected 'male' | 'female' | 'non-binary' | 'other' | 'prefer_not_to_say'"],
        },
      },
    },
  },

  SearchResponse401: {
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

  SearchResponse404: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3002 },
      message: { type: "string", example: "RESOURCE_NOT_FOUND" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Saved search not found." },
        },
      },
    },
  },

  SearchResponse500: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 5000 },
      message: { type: "string", example: "INTERNAL_ERROR" },
    },
  },
}