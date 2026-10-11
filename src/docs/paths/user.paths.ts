import { onboardingSchema } from "../schemas/user/onboarding.schema.ts"

export const userPaths = {
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
