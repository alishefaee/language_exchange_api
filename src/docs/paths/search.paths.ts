// src/docs/paths/search.paths.ts
import { searchSchemas } from "../schemas/search/search.schemas.ts"

export const searchPaths = {
  "/api/v1/search/users": {
    get: {
      tags: ["Search"],
      summary: "Search for language partners",
      description:
        "Searches active, onboarded users based on age range, gender, origin/residence country, single native/learning language, and space-separated bio keywords.",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: "query",
          name: "minAge",
          schema: { type: "integer", minimum: 13, maximum: 120 },
          description: "Minimum age of the language partner",
          example: 20,
        },
        {
          in: "query",
          name: "maxAge",
          schema: { type: "integer", minimum: 13, maximum: 120 },
          description: "Maximum age of the language partner",
          example: 35,
        },
        {
          in: "query",
          name: "gender",
          schema: {
            type: "string",
            enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
          },
          description: "Filter by gender",
          example: "female",
        },
        {
          in: "query",
          name: "countryOfOrigin",
          schema: { type: "string", minLength: 2, maxLength: 3 },
          description: "ISO country code of origin (e.g., BR, US)",
          example: "BR",
        },
        {
          in: "query",
          name: "countryOfResidence",
          schema: { type: "string", minLength: 2, maxLength: 3 },
          description: "ISO country code of current residence (e.g., DE, FR)",
          example: "DE",
        },
        {
          in: "query",
          name: "nativeLanguage",
          schema: { type: "string", minLength: 2, maxLength: 3 },
          description: "Single ISO language code spoken natively (e.g., pt)",
          example: "pt",
        },
        {
          in: "query",
          name: "learningLanguage",
          schema: { type: "string", minLength: 2, maxLength: 3 },
          description: "Single ISO language code being learned (e.g., de)",
          example: "de",
        },
        {
          in: "query",
          name: "keywords",
          schema: { type: "string", maxLength: 100 },
          description: "Space-separated keywords to match in user bio",
          example: "music travel coffee",
        },
        {
          in: "query",
          name: "page",
          schema: { type: "integer", minimum: 1, default: 1 },
          description: "Page number for pagination",
          example: 1,
        },
        {
          in: "query",
          name: "limit",
          schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
          description: "Number of results per page",
          example: 20,
        },
      ],
      responses: {
        "200": {
          description: "Paginated list of matching users",
          content: {
            "application/json": {
              schema: searchSchemas.SearchUsersResponse200,
            },
          },
        },
        "400": {
          description: "Validation failed on query parameters",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse401,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse500,
            },
          },
        },
      },
    },
  },

  "/api/v1/search/presets": {
    get: {
      tags: ["Search"],
      summary: "Get all saved search presets",
      description: "Retrieves all saved search filter presets owned by the authenticated user.",
      security: [{ BearerAuth: [] }],
      responses: {
        "200": {
          description: "List of saved search presets",
          content: {
            "application/json": {
              schema: searchSchemas.SavedSearchListResponse200,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse401,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse500,
            },
          },
        },
      },
    },

    post: {
      tags: ["Search"],
      summary: "Save a new search preset",
      description: "Saves a named search configuration for quick access later.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: searchSchemas.CreateSavedSearchRequest,
          },
        },
      },
      responses: {
        "201": {
          description: "Search preset created successfully",
          content: {
            "application/json": {
              schema: searchSchemas.SavedSearchResponse201,
            },
          },
        },
        "400": {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse401,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse500,
            },
          },
        },
      },
    },
  },

  "/api/v1/search/presets/{id}": {
    patch: {
      tags: ["Search"],
      summary: "Edit a saved search preset",
      description: "Updates the name or filter criteria of an existing saved search owned by the user.",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "The ID of the saved search preset",
          example: "6b1f9fd2581460a82416fa99",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: searchSchemas.UpdateSavedSearchRequest,
          },
        },
      },
      responses: {
        "200": {
          description: "Saved search updated successfully",
          content: {
            "application/json": {
              schema: searchSchemas.SavedSearchResponse200,
            },
          },
        },
        "400": {
          description: "Validation failed",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse401,
            },
          },
        },
        "404": {
          description: "Saved search preset not found",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse500,
            },
          },
        },
      },
    },

    delete: {
      tags: ["Search"],
      summary: "Delete a saved search preset",
      description: "Permanently deletes a saved search preset owned by the authenticated user.",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          in: "path",
          name: "id",
          required: true,
          schema: { type: "string" },
          description: "The ID of the saved search preset",
          example: "6b1f9fd2581460a82416fa99",
        },
      ],
      responses: {
        "200": {
          description: "Saved search deleted successfully",
          content: {
            "application/json": {
              schema: searchSchemas.DeleteSavedSearchResponse200,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse401,
            },
          },
        },
        "404": {
          description: "Saved search preset not found",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: searchSchemas.SearchResponse500,
            },
          },
        },
      },
    },
  },
}