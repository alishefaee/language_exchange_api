import { Hono } from "hono"
import { logger } from "hono/logger"
import { cors } from "hono/cors"
import { getLogger } from "@std/log"
import { router } from "./routes.ts"
import { swaggerRouter } from "./docs/swagger.ts"

const app = new Hono()

app.use(logger((message, ...rest) => {
  const appLogger = getLogger()
  appLogger.info(`${message} ${rest.join(" ")}`)
}))

app.use(
  "/*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true, // Allow cookies / authorization headers if needed
  }),
)

// Mount API routes
app.route("/api/v1", router)

// Mount Swagger documentation on /docs
// Access the UI via http://localhost:8000/docs/ui
app.route("/docs", swaggerRouter)

export { app }
