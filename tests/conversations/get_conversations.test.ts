// tests/conversations/get_conversations.test.ts
import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"
import { Conversation } from "../../src/models/Conversation.ts"

Deno.test({
  name: "Conversations API - Get Conversations",
  async fn(t) {
    await setupTestDB()

    // Register User A, User B, and User C
    const regA = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "get_conv_a@test.com", password: "securepassword123" }),
      }),
    )
    const dataA = await regA.json()
    const tokenA = dataA.data.access_token

    const regB = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "get_conv_b@test.com", password: "securepassword123" }),
      }),
    )
    const dataB = await regB.json()
    const userBId = dataB.data.user.id

    const regC = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "get_conv_c@test.com", password: "securepassword123" }),
      }),
    )
    const dataC = await regC.json()
    const userCId = dataC.data.user.id

    await t.step("GET /api/v1/conversations/ - Fails without authentication", async () => {
      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "GET",
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.UNAUTHORIZED.code)
    })

    await t.step("GET /api/v1/conversations/ - Fails with invalid query parameters", async () => {
      const req = new Request("http://localhost/api/v1/conversations/?page=0&limit=100", {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenA}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
    })

    await t.step("GET /api/v1/conversations/ - Returns empty list initially", async () => {
      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "GET",
        headers: { Authorization: `Bearer ${tokenA}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.OK.code)
      assertEquals(payload.data.conversations.length, 0)
      assertEquals(payload.data.pagination.total, 0)
    })

    await t.step(
      "GET /api/v1/conversations/ - Returns active conversations sorted by lastMessageAt and excludes hidden ones",
      async () => {
        // Create conversation with User B
        const convBRes = await app.request(
          new Request("http://localhost/api/v1/conversations/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenA}`,
            },
            body: JSON.stringify({ targetUserId: userBId }),
          }),
        )
        const convBData = await convBRes.json()
        const convBId = convBData.data.conversation._id

        // Create conversation with User C
        const convCRes = await app.request(
          new Request("http://localhost/api/v1/conversations/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenA}`,
            },
            body: JSON.stringify({ targetUserId: userCId }),
          }),
        )
        const convCData = await convCRes.json()
        const convCId = convCData.data.conversation._id

        // Send a message in conversation B so its lastMessageAt becomes the newest
        await app.request(
          new Request(`http://localhost/api/v1/conversations/${convBId}/messages`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokenA}`,
            },
            body: JSON.stringify({ text: "Latest message in B" }),
          }),
        )

        const req = new Request("http://localhost/api/v1/conversations/?page=1&limit=10", {
          method: "GET",
          headers: { Authorization: `Bearer ${tokenA}` },
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.success, true)
        assertEquals(payload.data.conversations.length, 2)
        assertEquals(payload.data.conversations[0]._id, convBId)
        assertExists(payload.data.conversations[0].lastMessage)
        assertEquals(payload.data.conversations[0].lastMessage.text, "Latest message in B")

        // Hide conversation C for User A
        await Conversation.findByIdAndUpdate(convCId, {
          $addToSet: { hiddenFor: dataA.data.user.id },
        })

        const resAfterHide = await app.request(
          new Request("http://localhost/api/v1/conversations/", {
            method: "GET",
            headers: { Authorization: `Bearer ${tokenA}` },
          }),
        )
        const payloadAfterHide = await resAfterHide.json()

        assertEquals(payloadAfterHide.data.conversations.length, 1)
        assertEquals(payloadAfterHide.data.conversations[0]._id, convBId)
      },
    )

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})