import mongoose from "mongoose"
import { ConsoleHandler, getLogger, RotatingFileHandler, setup } from "@std/log"
import { app } from "./app.ts"

await Deno.mkdir("./log", { recursive: true })
setup({
  handlers: {
    // 3. Instantiate them directly
    console: new ConsoleHandler("DEBUG"),
    file: new RotatingFileHandler("INFO", {
      filename: "./log/app.log",
      maxBytes: 1024 * 1024 * 5, // Rotate after 5MB
      maxBackupCount: 5, // Keep up to 5 old log files
      formatter: (record) => `${record.datetime.toISOString()} [${record.levelName}] ${record.msg}`,
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
})

const appLogger = getLogger()
appLogger.info("Logger initialized successfully.")

// Configure Database connection
const MONGODB_URI = Deno.env.get("MONGODB_URI")

if (!MONGODB_URI) {
  appLogger.critical("Fatal Error: MONGODB_URI environment variable is not set.")
  Deno.exit(1)
}

try {
  await mongoose.connect(MONGODB_URI)
  appLogger.info("Successfully connected to MongoDB.")
} catch (error) {
  appLogger.critical(`MongoDB connection failed: ${error}`)
  Deno.exit(1)
}

// Start the server
Deno.serve(app.fetch)
