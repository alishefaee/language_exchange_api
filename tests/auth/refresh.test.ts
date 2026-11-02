import { assertEquals, assertExists, assertFalse } from "@std/assert"
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

    // Register user to get a valid initial refresh token
    const regRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      }),
    )
    const regData = await regRes.json()
    const initialRefreshToken = regData.data.refresh_token

    await t.step("POST /api/v1/auth/refresh - Fails with invalid or missing refresh token", async () => {
      const req = new Request("http://localhost/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: "invalid_token_string" }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.UNAUTHORIZED.code)
    })

    await t.step("POST /api/v1/auth/refresh - Successfully rotates refresh token and returns new tokens", async () => {
      const req = new Request("http://localhost/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: initialRefreshToken }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.OK.code)
      assertExists(payload.data.access_token)
      assertExists(payload.data.refresh_token)
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})