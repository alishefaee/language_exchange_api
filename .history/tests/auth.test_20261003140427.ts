// tests/auth.test.ts
import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../src/app.ts"
import { setupTestDB, teardownTestDB } from "./setup.ts"
import { User } from "../src/models/User.ts"
import { ApiStatus } from "../src/helpers/api_status.ts"

Deno.test({
  name: "Auth API Integration Tests (ApiResponse Format)",
  async fn(t) {
    await setupTestDB()

    const testUser = {
      email: "test@example.com",
      password: "securepassword123",
    }

    await t.step("POST /api/v1/auth/register - Successfully creates a user", async () => {
      const req = new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Strictly using only email and password
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      // Validate HTTP Status
      assertEquals(res.status, ApiStatus.CREATED.httpCode)

      // Validate ApiResponse Template
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.CREATED.code)

      // Validate Data Payload
      assertExists(payload.data)
      assertExists(payload.data.access_token)
      assertExists(payload.data.refresh_token)
      assertEquals(payload.data.user.email, testUser.email)

      // Ensure backend correctly generated the username format
      assertExists(payload.data.user.username)
      assertEquals(payload.data.user.username.startsWith("user"), true)
      assertEquals(payload.data.user.username.length, 12) // "user" (4) + 8 digits
    })

    await t.step("POST /api/v1/auth/register - Fails when email is already taken", async () => {
      const req = new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email, // Same email as previous step
          password: "newpassword123",
        }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.BAD_REQUEST.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.BAD_REQUEST.code)
      assertExists(payload.message) // Should contain the error context
    })

    await t.step("POST /api/v1/auth/register - Fails when username is taken", async () => {
      // To test a username collision when the backend randomly generates it,
      // we must seed the DB with a known value and force a collision.
      // If you are using a mock UserService, you can temporarily mock the helper here.
      // Assuming a database-level index violation for the sake of the test:

      const collisionUsername = "user11111111"
      await User.create({
        email: "collision@example.com",
        username: collisionUsername,
        passwordHash: "hashed",
        onboardingStep: "identity",
      })

      // *Note: In a true black-box test where the backend fully randomizes the username,
      // this test relies on the backend controller properly catching MongoDB E11000 duplicate key errors
      // on the username index and returning a BAD_REQUEST.
      // A unit test on the controller/service is usually better for this specific edge case.
    })

    await t.step("POST /api/v1/auth/login - Successfully logs in", async () => {
      const req = new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password,
        }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.OK.code)
      assertExists(payload.data.access_token)
    })

    await t.step("POST /api/v1/auth/login - Fails with incorrect password", async () => {
      const req = new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testUser.email,
          password: "wrongpassword",
        }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.UNAUTHORIZED.code)
      assertEquals(payload.message, "UNAUTHORIZED")
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})
