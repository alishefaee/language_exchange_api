// tests/search/get_saved_searches.test.ts
import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Search API - Get Saved Search Presets",
  async fn(t) {
    await setupTestDB()

    const regRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "list_presets@test.com",
          password: "securepassword123",
        }),
      }),
    )
    const regData = await regRes.json()
    const accessToken = regData.data.access_token

    await t.step("GET /api/v1/search/presets - Fails without authentication", async () => {
      const req = new Request("http://localhost/api/v1/search/presets", {
        method: "GET",
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
    })

    await t.step("GET /api/v1/search/presets - Returns empty list initially", async () => {
      const req = new Request("http://localhost/api/v1/search/presets", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.OK.code)
      assertEquals(payload.data.savedSearches.length, 0)
    })

    await t.step("GET /api/v1/search/presets - Returns all saved presets for the user", async () => {
      // Seed two presets via the API
      await app.request(
        new Request("http://localhost/api/v1/search/presets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: "Preset 1", nativeLanguage: "es" }),
        }),
      )

      await app.request(
        new Request("http://localhost/api/v1/search/presets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ name: "Preset 2", learningLanguage: "fr" }),
        }),
      )

      const req = new Request("http://localhost/api/v1/search/presets", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertExists(payload.data.savedSearches)
      assertEquals(payload.data.savedSearches.length, 2)
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})