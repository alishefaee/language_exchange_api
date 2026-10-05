import { Hono } from "hono"
import { logger } from "hono/logger"
import { getLogger } from "@std/log"
import { router } from "./routes.ts"

const app = new Hono()

// Global Logging Middleware
app.use(logger((message, ...rest) => {
  const appLogger = getLogger()
  appLogger.info(`${message} ${rest.join(" ")}`)
}))

// Mount the decoupled router onto the API version path
app.route("/api/v1", router)

export { app }
