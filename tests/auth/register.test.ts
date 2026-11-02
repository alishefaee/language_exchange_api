import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Auth API - Register",
  async fn(t) {
    await setupTestDB()

    const testUser = {
      email: "register@test.com",
      password: "securepassword123",
    }

    await t.step("POST /api/v1/auth/register - Successfully creates a user", async () => {
      const req = new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.CREATED.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.CREATED.code)
      assertExists(payload.data.access_token)
      assertExists(payload.data.refresh_token)

      const { user } = payload.data
      // Standard ID check: only _id is returned, id is omitted
      assertExists(user._id)
      assertEquals(user.id, undefined)

      // Stripped fields check
      assertEquals(user.passwordHash, undefined)
      assertEquals(user.__v, undefined)

      // Full user record fields check
      assertEquals(user.email, testUser.email)
      assertExists(user.username)
      assertEquals(user.onboardingStep, "identity")
      assertEquals(user.bio, "")
      assertEquals(Array.isArray(user.nativeLanguages), true)
      assertEquals(Array.isArray(user.learningLanguages), true)
      assertEquals(Array.isArray(user.blockedUsers), true)
      assertExists(user.lastLogin)
      assertExists(user.createdAt)
      assertExists(user.updatedAt)
    })

    await t.step("POST /api/v1/auth/register - Fails when email is already taken", async () => {
      const req = new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.BAD_REQUEST.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.BAD_REQUEST.code)
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})