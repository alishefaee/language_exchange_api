import { authPaths } from "./paths/auth.paths.ts"
import { commonSchemas } from "./schemas/common.ts"
import { registerSchema } from "./schemas/auth/register.schema.ts"
import { userPaths } from "./paths/user.paths.ts"
import { searchPaths } from "./paths/search.paths.ts"

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Language Partner API",
    version: "1.0.0",
    description: "API documentation for the Language Partner matching platform.",
  },
  servers: [
    {
      url: "http://localhost:8000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ...commonSchemas,
      ...registerSchema,
    },
  },
  security: [
    { BearerAuth: [] },
  ],
  paths: {
    ...authPaths,
    ...userPaths,
    ...searchPaths,
    // ...conversationPaths
  },
}
