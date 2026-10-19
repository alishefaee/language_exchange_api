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

export const onboardingSchema = {
  LanguageLevel,
  OnboardingRequest: {
    type: "object",
    properties: {
      dateOfBirth: { type: "string", format: "date", example: "1998-05-14" },
      gender: {
        type: "string",
        enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
        example: "female",
      },
      religion: { type: "string", example: "agnostic" },
      countryOfOrigin: { type: "string", minLength: 2, maxLength: 3, example: "BR" },
      countryOfResidence: { type: "string", minLength: 2, maxLength: 3, example: "DE" },
      nativeLanguages: {
        type: "array",
        items: LanguageLevel,
      },
      learningLanguages: {
        type: "array",
        items: LanguageLevel,
      },
      bio: { type: "string", maxLength: 300, example: "Looking for German native speakers!" },
      avatarUrl: { type: "string", format: "uri", example: "https://example.com/avatar.jpg" },
    },
  },
  OnboardingResponse200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "6aca2c9a423540e305ec9244" },
              email: { type: "string", format: "email", example: "user1@example.com" },
              username: { type: "string", example: "user91879756" },
              onboardingStep: { type: "string", example: "completed" },
            },
          },
        },
      },
    },
  },
  OnboardingResponse400: {
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
          nativeLanguages: ["Invalid input: expected object, received string"],
          learningLanguages: ["Invalid input: expected object, received string"],
        },
      },
    },
  },
  OnboardingResponse401: {
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
  OnboardingResponse404: {
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
}