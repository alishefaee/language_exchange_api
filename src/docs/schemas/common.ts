export const LanguageLevelItem = {
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

export const UserResponseItem = {
  type: "object",
  properties: {
    _id: { type: "string", example: "6ac9fd2581460a82416fa4aa" },
    username: { type: "string", example: "user91879756" },
    email: { type: "string", format: "email", example: "user@example.com" },
    bio: { type: "string", maxLength: 300, example: "Looking for German native speakers!" },
    avatarUrl: {
      type: "string",
      format: "uri",
      nullable: true,
      example: "https://example.com/avatar.jpg",
    },
    dateOfBirth: {
      type: "string",
      format: "date-time",
      nullable: true,
      example: "1998-05-14T00:00:00.000Z",
    },
    age: { type: "integer", nullable: true, example: 28 },
    gender: {
      type: "string",
      enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
      nullable: true,
      example: "female",
    },
    religion: { type: "string", nullable: true, example: "agnostic" },
    countryOfOrigin: { type: "string", nullable: true, example: "BR" },
    countryOfResidence: { type: "string", nullable: true, example: "DE" },
    nativeLanguages: {
      type: "array",
      items: LanguageLevelItem,
    },
    learningLanguages: {
      type: "array",
      items: LanguageLevelItem,
    },
    lastLogin: {
      type: "string",
      format: "date-time",
      example: "2026-10-18T11:30:00.000Z",
    },
    lastUpdatedProfile: {
      type: "string",
      format: "date-time",
      nullable: true,
      example: "2026-10-18T11:35:00.000Z",
    },
    onboardingStep: {
      type: "string",
      enum: ["identity", "locations", "languages", "avatar", "completed"],
      example: "completed",
    },
    blockedUsers: {
      type: "array",
      items: { type: "string", example: "6ac9fd2581460a82416fa4bb" },
      example: [],
    },
    createdAt: {
      type: "string",
      format: "date-time",
      example: "2026-10-18T11:00:00.000Z",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      example: "2026-10-18T11:35:00.000Z",
    },
  },
}

export const commonSchemas = {
  LanguageLevel: LanguageLevelItem,
  UserResponseItem,
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