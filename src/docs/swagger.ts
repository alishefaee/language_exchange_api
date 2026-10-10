import { Hono } from "hono"
import { swaggerUI } from "@hono/swagger-ui"
import { openApiSpec } from "./spec.ts"

export const swaggerRouter = new Hono()

// Serve the raw OpenAPI JSON specification
swaggerRouter.get("/openapi.json", (c) => {
  return c.json(openApiSpec)
})

// Serve the interactive Swagger UI interface
swaggerRouter.get("/ui", swaggerUI({ url: "/docs/openapi.json" }))
