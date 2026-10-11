import { loginSchema } from "../schemas/auth/login.schema.ts"
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
}
