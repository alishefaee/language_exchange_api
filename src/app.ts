import { Hono } from "hono"
import { logger } from "hono/logger"
import { getLogger } from "@std/log"

import * as authController from "./controllers/auth.ts"
import * as userController from "./controllers/users.ts"
import * as conversationController from "./controllers/conversations.ts"
import * as messageController from "./controllers/messages.ts"
import { loginSchema, registerSchema, tokenSchema } from "./validator/auth_validator.ts"
import { validate } from "./validator/validators.ts"

const app = new Hono()

// Middleware
app.use(logger((message, ...rest) => {
  // Fetch logger dynamically inside the callback so it uses
  // the configuration initialized in main.ts
  const appLogger = getLogger()
  appLogger.info(`${message} ${rest.join(" ")}`)
}))

const router = new Hono()

// Auth Routes
router.post("/auth/register", validate("json", registerSchema), authController.register)
router.post("/auth/login", validate("json", loginSchema), authController.login)
router.post("/auth/refresh", validate("json", tokenSchema), authController.refresh)
router.post("/auth/logout", validate("json", tokenSchema), authController.logout)

// User Routes
router.get("/users/state", userController.getOnboardingState)
router.patch("/users/identity", userController.updateIdentity)
router.patch("/users/locations", userController.updateLocations)
router.patch("/users/languages", userController.updateLanguages)
router.post("/users/avatar-upload-url", userController.getAvatarUploadUrl)
router.post("/users/complete", userController.completeOnboarding)

// Conversation Routes
router.get("/conversations/", conversationController.getConversations)
router.post("/conversations/", conversationController.createConversation)
router.delete("/conversations/:id", conversationController.deleteConversation)
router.get("/conversations/:id/messages", conversationController.getConversationMessages)
router.post("/conversations/:id/messages", conversationController.sendConversationMessage)

// Message Routes
router.delete("/:id", messageController.deleteMessage)

// Mount the router onto the main app
app.route("/api/v1", router)

export { app }
