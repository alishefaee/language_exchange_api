import { Hono } from "hono";
import mongoose from "mongoose";
import * as authController from "./controllers/auth.ts";
import * as userController from "./controllers/users.ts";
import * as conversationController from "./controllers/conversations.ts";
import * as messageController from "./controllers/messages.ts";

const MONGODB_URI = Deno.env.get("MONGODB_URI");

if (!MONGODB_URI) {
    console.error("Fatal Error: MONGODB_URI environment variable is not set.");
    Deno.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log("Successfully connected to MongoDB"))
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
        Deno.exit(1);
    });

export const router = new Hono();

router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

router.get("/users/state", userController.getOnboardingState);
router.patch("/users/identity", userController.updateIdentity);
router.patch("/users/locations", userController.updateLocations);
router.patch("/users/languages", userController.updateLanguages);
router.post("/users/avatar-upload-url", userController.getAvatarUploadUrl);
router.post("/users/complete", userController.completeOnboarding);

router.get("/conversations/", conversationController.getConversations);
router.post("/conversations/", conversationController.createConversation);
router.delete("/conversations/:id", conversationController.deleteConversation);
router.get("/conversations/:id/messages", conversationController.getConversationMessages);
router.post("/conversations/:id/messages", conversationController.sendConversationMessage);

router.delete("/:id", messageController.deleteMessage);