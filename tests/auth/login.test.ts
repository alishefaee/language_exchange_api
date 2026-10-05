import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Auth API - Login",
  async fn(t) {
    await setupTestDB()

    const testUser = {
      email: "login@test.com",
      password: "securepassword123",
    }

    // Seed user for login tests
    await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      }),
    )

    await t.step("POST /api/v1/auth/login - Fails with unregistered email", async () => {
      const req = new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "nobody@test.com",
          password: "securepassword123",
        }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.AUTH_USER_NOT_FOUND.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.AUTH_USER_NOT_FOUND.code)
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

      assertEquals(res.status, ApiStatus.AUTH_USER_NOT_FOUND.httpCode)
      assertFalse(payload.success)
    })

    await t.step("POST /api/v1/auth/login - Successfully logs in", async () => {
      const req = new Request("http://localhost/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertExists(payload.data.access_token)
      assertExists(payload.data.refresh_token)
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})
