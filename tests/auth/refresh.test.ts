import { assertEquals, assertExists, assertFalse, assertNotEquals } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Auth API - Token Refresh",
  async fn(t) {
    await setupTestDB()

    const testUser = {
      email: "refresh@test.com",
      password: "securepassword123",
    }

    let initialRefreshToken = ""
    let initialAccessToken = ""

    // Seed user and capture tokens
    const registerRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      }),
    )
    const registerPayload = await registerRes.json()
    initialRefreshToken = registerPayload.data.refresh_token
    initialAccessToken = registerPayload.data.access_token

    await t.step("POST /api/v1/auth/refresh - Fails with invalid refresh token", async () => {
      const req = new Request("http://localhost/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "invalid_or_expired_token" }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.AUTH_TOKEN_EXPIRED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.AUTH_TOKEN_EXPIRED.code)
    })

    await t.step("POST /api/v1/auth/refresh - Successfully rotates tokens", async () => {
      //   await new Promise((resolve) => setTimeout(resolve, 1000))

      const req = new Request("http://localhost/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: initialRefreshToken }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)

      assertNotEquals(payload.data.access_token, initialAccessToken)
      assertNotEquals(payload.data.refresh_token, initialRefreshToken)
      assertExists(payload.data.access_token)
      assertExists(payload.data.refresh_token)
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})
