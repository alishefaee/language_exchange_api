import { Hono } from "hono";

const app = new Hono();

// --- Auth Router ---
const authRouter = new Hono();

authRouter.post("/register", async (c) => {
  // TODO: Implement registration logic
});

authRouter.post("/login", async (c) => {
  // TODO: Implement login logic
});


// --- Onboarding Router ---
const onboardingRouter = new Hono();

onboardingRouter.get("/state", async (c) => {
  // TODO: Implement fetch onboarding state
});

onboardingRouter.patch("/identity", async (c) => {
  // TODO: Implement update identity demographics
});

onboardingRouter.patch("/locations", async (c) => {
  // TODO: Implement update locations
});

onboardingRouter.patch("/languages", async (c) => {
  // TODO: Implement update language proficiencies
});

onboardingRouter.post("/avatar-upload-url", async (c) => {
  // TODO: Implement presigned URL generation for avatar
});

onboardingRouter.post("/complete", async (c) => {
  // TODO: Implement finalize onboarding and mark profile active
});


// --- Conversations Router ---
const conversationsRouter = new Hono();

conversationsRouter.get("/", async (c) => {
  // TODO: Implement fetch paginated list of conversations
});

conversationsRouter.post("/", async (c) => {
  // TODO: Implement create new conversation
});

conversationsRouter.delete("/:id", async (c) => {
  // TODO: Implement clear chat history for the current user
});

conversationsRouter.get("/:id/messages", async (c) => {
  // TODO: Implement fetch paginated messages for a conversation
});

conversationsRouter.post("/:id/messages", async (c) => {
  // TODO: Implement send new message
});


// --- Messages Router ---
const messagesRouter = new Hono();

messagesRouter.delete("/:id", async (c) => {
  // TODO: Implement hard delete message for everyone (sender only)
});


// --- Mount All Routes ---
app.route("/api/v1/auth", authRouter);
app.route("/api/v1/onboarding", onboardingRouter);
app.route("/api/v1/conversations", conversationsRouter);
app.route("/api/v1/messages", messagesRouter);

export default app;