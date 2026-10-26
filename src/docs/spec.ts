import { authPaths } from "./paths/auth.paths.ts"
import { userPaths } from "./paths/user.paths.ts"
import { searchPaths } from "./paths/search.paths.ts"
import { conversationPaths } from "./paths/conversations.paths.ts"
import { messagePaths } from "./paths/messages.paths.ts"

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
    schemas: {},
  },
  security: [
    { BearerAuth: [] },
  ],
  paths: {
    ...authPaths,
    ...userPaths,
    ...searchPaths,
    ...conversationPaths,
    ...messagePaths,
  },
}
