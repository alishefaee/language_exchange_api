import { Hono } from "hono"
import { logger } from "hono/logger"
import { getLogger } from "@std/log"
import { router } from "./routes.ts"
import { swaggerRouter } from "./docs/swagger.ts"

const app = new Hono()

app.use(logger((message, ...rest) => {
  const appLogger = getLogger()
  appLogger.info(`${message} ${rest.join(" ")}`)
}))

// Mount API routes
app.route("/api/v1", router)

// Mount Swagger documentation on /docs
// Access the UI via http://localhost:8000/docs/ui
app.route("/docs", swaggerRouter)

export { app }
