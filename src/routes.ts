import { Hono } from "hono"
import * as authController from "./controllers/auth.ts"
import * as userController from "./controllers/users.ts"
import * as conversationController from "./controllers/conversations.ts"
import * as messageController from "./controllers/messages.ts"
import { validate } from "./validators/validator.ts"
import { loginSchema, registerSchema, tokenSchema } from "./validators/auth_validator.ts"
import { requireAuth } from "./middlewares/auth_middleware.ts"

export const router = new Hono()

// --- Public Routes ---
router.post("/auth/register", validate("json", registerSchema), authController.register)
router.post("/auth/login", validate("json", loginSchema), authController.login)
router.post("/auth/refresh", validate("json", tokenSchema), authController.refresh)

// --- Protected Routes ---
// Apply the auth middleware to all subsequent routes in this group
const protectedRouter = new Hono()
protectedRouter.use("*", requireAuth)

protectedRouter.post("/auth/logout", validate("json", tokenSchema), authController.logout)

// User Routes
protectedRouter.get("/users/state", userController.getOnboardingState)
protectedRouter.patch("/users/identity", userController.updateIdentity)
protectedRouter.patch("/users/locations", userController.updateLocations)
protectedRouter.patch("/users/languages", userController.updateLanguages)
protectedRouter.post("/users/avatar-upload-url", userController.getAvatarUploadUrl)
protectedRouter.post("/users/complete", userController.completeOnboarding)

// Conversation Routes
protectedRouter.get("/conversations/", conversationController.getConversations)
protectedRouter.post("/conversations/", conversationController.createConversation)
protectedRouter.delete("/conversations/:id", conversationController.deleteConversation)
protectedRouter.get("/conversations/:id/messages", conversationController.getConversationMessages)
protectedRouter.post("/conversations/:id/messages", conversationController.sendConversationMessage)

// Message Routes
protectedRouter.delete("/messages/:id", messageController.deleteMessage)

// Mount protected routes to the main router
router.route("/", protectedRouter)
