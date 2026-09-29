export const ApiStatus = Object.freeze(
  {
    // Success (1xxx)
    OK: { code: 1000, httpCode: 200 },
    CREATED: { code: 1001, httpCode: 201 },

    // Authentication & Authorization (2xxx)
    UNAUTHORIZED: { code: 2000, httpCode: 401 },
    FORBIDDEN: { code: 2001, httpCode: 403 },
    AUTH_WEAK_PASSWORD: { code: 2002, httpCode: 400 },
    AUTH_USER_NOT_FOUND: { code: 2003, httpCode: 404 },
    AUTH_TOKEN_EXPIRED: { code: 2004, httpCode: 401 },

    // General Client Errors (3xxx)
    BAD_REQUEST: { code: 3000, httpCode: 400 },
    VALIDATION_FAILED: { code: 3001, httpCode: 400 },
    RESOURCE_NOT_FOUND: { code: 3002, httpCode: 404 },

    // Server Errors (5xxx)
    INTERNAL_ERROR: { code: 5000, httpCode: 500 },
  } as const,
)

// Extracts a union type of all valid keys (e.g., "OK" | "AUTH_WEAK_PASSWORD")
export type ApiStatusKey = keyof typeof ApiStatus
