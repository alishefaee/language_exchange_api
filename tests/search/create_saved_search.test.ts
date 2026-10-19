// tests/search/create_saved_search.test.ts
import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Search API - Create Saved Search Preset",
  async fn(t) {
    await setupTestDB()

    const regRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "create_preset@test.com",
          password: "securepassword123",
        }),
      }),
    )
    const regData = await regRes.json()
    const accessToken = regData.data.access_token

    await t.step("POST /api/v1/search/presets - Fails without authentication", async () => {
      const req = new Request("http://localhost/api/v1/search/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Unauthorized Preset" }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.UNAUTHORIZED.code)
    })

    await t.step("POST /api/v1/search/presets - Successfully saves a search preset", async () => {
      const presetPayload = {
        name: "Brazilian German Learners",
        minAge: 20,
        maxAge: 35,
        gender: "female",
        countryOfOrigin: "BR",
        countryOfResidence: "DE",
        nativeLanguage: "pt",
        learningLanguage: "de",
        keywords: "music travel coffee",
      }

      const req = new Request("http://localhost/api/v1/search/presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(presetPayload),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.CREATED.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.CREATED.code)
      assertExists(payload.data.savedSearch)
      assertExists(payload.data.savedSearch._id)
      assertEquals(payload.data.savedSearch.name, presetPayload.name)
      assertEquals(payload.data.savedSearch.nativeLanguage, "pt")
      assertEquals(payload.data.savedSearch.learningLanguage, "de")
      assertEquals(payload.data.savedSearch.keywords, "music travel coffee")
    })

    await t.step("POST /api/v1/search/presets - Fails when name is missing", async () => {
      const req = new Request("http://localhost/api/v1/search/presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          minAge: 22,
          nativeLanguage: "en",
        }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
    })

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})