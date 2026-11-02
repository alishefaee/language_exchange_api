import { avatarSchema } from "../schemas/user/avatar.schema.ts"
import { onboardingSchema } from "../schemas/user/onboarding.schema.ts"

export const userPaths = {
  "/api/v1/users/avatar": {
    post: {
      tags: ["Users"],
      summary: "Upload user avatar image",
      description:
        "Uploads a profile picture via multipart/form-data, updates the authenticated user's avatarUrl, and returns the public URI.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: avatarSchema.UploadAvatarRequest,
          },
        },
      },
      responses: {
        "200": {
          description: "Avatar successfully uploaded",
          content: {
            "application/json": {
              schema: avatarSchema.UploadAvatarResponse200,
            },
          },
        },
        "400": {
          description: "Validation failed (missing file, unsupported format, or file > 5MB)",
          content: {
            "application/json": {
              schema: avatarSchema.UploadAvatarResponse400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Invalid or missing Bearer token",
          content: {
            "application/json": {
              schema: avatarSchema.UploadAvatarResponse401,
            },
          },
        },
        "404": {
          description: "User account no longer exists",
          content: {
            "application/json": {
              schema: avatarSchema.UploadAvatarResponse404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: avatarSchema.UploadAvatarResponse500,
            },
          },
        },
      },
    },
  },
  "/api/v1/users/onboarding": {
    post: {
      tags: ["Users"],
      summary: "Complete user onboarding profile",
      description:
        "Updates the user profile with optional demographic and language data, setting the onboarding status to completed.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: onboardingSchema.OnboardingRequest,
          },
        },
      },
      responses: {
        "200": {
          description: "Profile successfully updated",
          content: {
            "application/json": {
              schema: onboardingSchema.OnboardingResponse200,
            },
          },
        },
        "400": {
          description: "Validation failed (e.g., invalid language code or date format)",
          content: {
            "application/json": {
              schema: onboardingSchema.OnboardingResponse400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Invalid or missing Bearer token",
          content: {
            "application/json": {
              schema: onboardingSchema.OnboardingResponse401,
            },
          },
        },
        "404": {
          description: "User account no longer exists",
          content: {
            "application/json": {
              schema: onboardingSchema.OnboardingResponse404,
            },
          },
        },
      },
    },
  },
}
