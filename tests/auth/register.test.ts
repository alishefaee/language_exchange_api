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
      assertEquals(payload.data.user.email, testUser.email)
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
