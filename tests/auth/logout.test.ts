import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Auth API - Logout",
  async fn(t) {
    await setupTestDB()

    const testUser = {
      email: "logout@test.com",
      password: "securepassword123",
    }

    // Register user to get tokens
    const regRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      }),
    )
    const regData = await regRes.json()
    const accessToken = regData.data.access_token
    const refreshToken = regData.data.refresh_token

    await t.step("POST /api/v1/auth/logout - Fails without authentication header", async () => {
      const req = new Request("http://localhost/api/v1/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.UNAUTHORIZED.code)
    })

    await t.step("POST /api/v1/auth/logout - Successfully logs out and revokes refresh token", async () => {
      const req = new Request("http://localhost/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.OK.code)

      // Verify that using the revoked refresh token now fails
      const refreshReq = new Request("http://localhost/api/v1/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const refreshRes = await app.request(refreshReq)
      assertEquals(refreshRes.status, ApiStatus.UNAUTHORIZED.httpCode)
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})