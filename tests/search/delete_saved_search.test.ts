// tests/search/delete_saved_search.test.ts
import { assertEquals, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Search API - Delete Saved Search Preset",
  async fn(t) {
    await setupTestDB()

    // Register User A (Owner)
    const userARes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "owner_delete@test.com",
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
          email: "intruder_delete@test.com",
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
          name: "Preset To Delete",
          nativeLanguage: "it",
        }),
      }),
    )
    const presetId = (await createRes.json()).data.savedSearch._id

    await t.step(
      "DELETE /api/v1/search/presets/:id - Fails when another user tries to delete it",
      async () => {
        const req = new Request(`http://localhost/api/v1/search/presets/${presetId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenB}` },
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.RESOURCE_NOT_FOUND.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.RESOURCE_NOT_FOUND.code)
      },
    )

    await t.step(
      "DELETE /api/v1/search/presets/:id - Successfully deletes owned preset",
      async () => {
        const req = new Request(`http://localhost/api/v1/search/presets/${presetId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenA}` },
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.success, true)
        assertEquals(payload.code, ApiStatus.OK.code)
        assertEquals(payload.data.message, "Saved search deleted successfully.")
      },
    )

    await t.step(
      "DELETE /api/v1/search/presets/:id - Returns 404 when deleting an already deleted preset",
      async () => {
        const req = new Request(`http://localhost/api/v1/search/presets/${presetId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenA}` },
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