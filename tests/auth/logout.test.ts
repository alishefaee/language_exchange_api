import { assertEquals, assertFalse } from "@std/assert"
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

    let accessToken = ""
    let refreshToken = ""

    // Seed user and capture tokens
    const registerRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      }),
    )
    const registerPayload = await registerRes.json()
    accessToken = registerPayload.data.access_token
    refreshToken = registerPayload.data.refresh_token

    await t.step("POST /api/v1/auth/logout - Successfully revokes current session", async () => {
      const req = new Request("http://localhost/api/v1/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.data.message, "Successfully logged out of current device")
    })

    await t.step(
      "POST /api/v1/auth/refresh - Fails to refresh after session is logged out",
      async () => {
        const req = new Request("http://localhost/api/v1/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })

        const res = await app.request(req)
        const payload = await res.json()

        // The previous logout deleted the token, triggering an expiration error[cite: 4]
        assertEquals(res.status, ApiStatus.AUTH_TOKEN_EXPIRED.httpCode)
        assertFalse(payload.success)
      },
    )

    await t.step("POST /api/v1/auth/logout-all - Fails without valid access token", async () => {
      const req = new Request("http://localhost/api/v1/auth/logout-all", {
        method: "POST",
        // Deliberately omitting Authorization header
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
    })

    // await t.step("POST /api/v1/auth/logout-all - Successfully wipes all device sessions", async () => {
    //   // Generate a new valid session first
    //   const loginRes = await app.request(
    //     new Request("http://localhost/api/v1/auth/login", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(testUser),
    //     })
    //   )
    //   const loginPayload = await loginRes.json()
    //   const newAccessToken = loginPayload.data.access_token

    //   const req = new Request("http://localhost/api/v1/auth/logout-all", {
    //     method: "POST",
    //     headers: {
    //       "Authorization": `Bearer ${newAccessToken}`
    //     },
    //   })

    //   const res = await app.request(req)
    //   const payload = await res.json()

    //   assertEquals(res.status, ApiStatus.OK.httpCode)
    //   assertEquals(payload.success, true)
    //   assertEquals(payload.data.message, "Successfully logged out of all devices")
    // })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})
