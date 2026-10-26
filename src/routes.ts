import { Hono } from "hono"
import * as authController from "./controllers/auth.ts"
import * as userController from "./controllers/users.ts"
import * as conversationController from "./controllers/conversations.ts"
import * as messageController from "./controllers/messages.ts"
import { validate } from "./validators/validator.ts"
import { loginSchema, registerSchema, tokenSchema } from "./validators/auth_validator.ts"
import { requireAuth } from "./middlewares/auth_middleware.ts"
import { onboardingProfileSchema } from "./validators/user_validator.ts"
import * as searchController from "./controllers/search.ts"
import {
  createSavedSearchSchema,
  executeSearchQuerySchema,
  updateSavedSearchSchema,
} from "./validators/search_validator.ts"
import {
  createConversationSchema,
  getConversationsQuerySchema,
  getMessagesQuerySchema,
  idParamSchema,
  sendMessageSchema,
} from "./validators/conversation_validator.ts"

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

protectedRouter.post(
  "/users/onboarding",
  validate("json", onboardingProfileSchema),
  userController.completeOnboarding,
)

// Search
protectedRouter.get(
  "/search/users",
  validate("query", executeSearchQuerySchema),
  searchController.searchUsers,
)

// Saved Search Presets CRUD
protectedRouter.get("/search/presets", searchController.getSavedSearches)
protectedRouter.post(
  "/search/presets",
  validate("json", createSavedSearchSchema),
  searchController.createSavedSearch,
)
protectedRouter.patch(
  "/search/presets/:id",
  validate("json", updateSavedSearchSchema),
  searchController.updateSavedSearch,
)
protectedRouter.delete("/search/presets/:id", searchController.deleteSavedSearch)

// Conversation Routes
protectedRouter.get(
  "/conversations/",
  validate("query", getConversationsQuerySchema),
  conversationController.getConversations,
)
protectedRouter.post(
  "/conversations/",
  validate("json", createConversationSchema),
  conversationController.createConversation,
)
protectedRouter.delete(
  "/conversations/:id",
  validate("param", idParamSchema),
  conversationController.deleteConversation,
)
protectedRouter.get(
  "/conversations/:id/messages",
  validate("param", idParamSchema),
  validate("query", getMessagesQuerySchema),
  conversationController.getConversationMessages,
)
protectedRouter.post(
  "/conversations/:id/messages",
  validate("param", idParamSchema),
  validate("json", sendMessageSchema),
  conversationController.sendConversationMessage,
)

// Message Routes
protectedRouter.delete(
  "/messages/:id",
  validate("param", idParamSchema),
  messageController.deleteMessage,
)

// Mount protected routes to the main router
router.route("/", protectedRouter)
