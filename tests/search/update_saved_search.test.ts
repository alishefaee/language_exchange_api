// tests/search/update_saved_search.test.ts
import { assertEquals, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Search API - Update Saved Search Preset",
  async fn(t) {
    await setupTestDB()

    // Register User A (Owner)
    const userARes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "owner_update@test.com",
          password: "securepassword123",
        }),
      }),
    )
    const tokenA = (await userARes.json()).data.access_token

    // Register User B (Other User)
    const userBRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "intruder_update@test.com",
          password: "securepassword123",
        }),
      }),
    )
    const tokenB = (await userBRes.json()).data.access_token

    // Create a preset owned by User A
    const createRes = await app.request(
      new Request("http://localhost/api/v1/search/presets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          name: "Initial Preset",
          minAge: 18,
          nativeLanguage: "en",
          keywords: "books movies",
        }),
      }),
    )
    const presetId = (await createRes.json()).data.savedSearch._id

    await t.step("PATCH /api/v1/search/presets/:id - Successfully updates owned preset", async () => {
      const req = new Request(`http://localhost/api/v1/search/presets/${presetId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({
          name: "Updated Preset",
          minAge: 24,
          keywords: "coding chess",
        }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.OK.code)
      assertEquals(payload.data.savedSearch.name, "Updated Preset")
      assertEquals(payload.data.savedSearch.minAge, 24)
      assertEquals(payload.data.savedSearch.keywords, "coding chess")
      assertEquals(payload.data.savedSearch.nativeLanguage, "en") // Unchanged field preserved
    })

    await t.step(
      "PATCH /api/v1/search/presets/:id - Fails when another user tries to edit it",
      async () => {
        const req = new Request(`http://localhost/api/v1/search/presets/${presetId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenB}`,
          },
          body: JSON.stringify({ name: "Hijacked Preset" }),
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.RESOURCE_NOT_FOUND.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.RESOURCE_NOT_FOUND.code)
      },
    )

    await t.step(
      "PATCH /api/v1/search/presets/:id - Returns 404 for non-existent preset ID",
      async () => {
        const fakeId = "60d5ec49f1b2c8b1f8e4e1a1"
        const req = new Request(`http://localhost/api/v1/search/presets/${fakeId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({ name: "Ghost Preset" }),
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.RESOURCE_NOT_FOUND.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.RESOURCE_NOT_FOUND.code)
      },
    )

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})