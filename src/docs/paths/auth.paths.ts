import { loginSchema } from "../schemas/auth/login.schema.ts"
import { logoutSchema } from "../schemas/auth/logout.schema.ts"
import { registerSchema } from "../schemas/auth/register.schema.ts"

export const authPaths = {
  "/api/v1/auth/register": {
    post: {
      tags: ["Authentication"],
      summary: "Register a new user",
      description: "Creates a new user account and returns access and refresh tokens.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email", example: "user@example.com" },
                password: {
                  type: "string",
                  format: "password",
                  minLength: 8,
                  example: "securepassword123",
                },
              },
            },
          },
        },
      },
      responses: {
        "201": {
          description: "User successfully created",
          content: {
            "application/json": {
              schema: registerSchema.authRegisterSuccess,
            },
          },
        },
        "400": {
          description: "Validation failed or email already taken",
          content: {
            "application/json": {
              schema: registerSchema.authRegister400,
            },
          },
        },
      },
    },
  },
  "/api/v1/auth/login": {
    post: {
      tags: ["Authentication"],
      summary: "User login",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              stype: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", format: "password" },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Successful login",
          content: {
            "application/json": {
              schema: loginSchema.authLoginSuccess,
            },
          },
        },
        "401": {
          description: "Invalid credentials",
          content: {
            "application/json": {
              schema: loginSchema.authLogin401,
            },
          },
        },
      },
    },
  },
  "/api/v1/auth/logout": {
    post: {
      tags: ["Authentication"],
      summary: "Logout user from current device",
      description: "Revokes the provided refresh token and ends the current device session.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["refresh_token"],
              properties: {
                refresh_token: {
                  type: "string",
                  minLength: 1,
                  example: "91e30838-62b4-4957-b6ba-e5dcb0d9a3d0",
                },
              },
            },
          },
        },
      },
      responses: {
        "200": {
          description: "Successfully logged out",
          content: {
            "application/json": {
              schema: logoutSchema.authLogoutSuccess,
            },
          },
        },
        "400": {
          description: "Validation failed (missing refresh token)",
          content: {
            "application/json": {
              schema: logoutSchema.authLogout400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Invalid or missing Bearer token",
          content: {
            "application/json": {
              schema: logoutSchema.authLogout401,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: logoutSchema.authLogout500,
            },
          },
        },
      },
    },
  },
}
