// tests/conversations/send_message.test.ts
import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"
import { Conversation } from "../../src/models/Conversation.ts"

Deno.test({
  name: "Conversations API - Send Conversation Message",
  async fn(t) {
    await setupTestDB()

    const regA = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "send_msg_a@test.com", password: "securepassword123" }),
      }),
    )
    const dataA = await regA.json()
    const tokenA = dataA.data.access_token
    const userAId = dataA.data.user.id

    const regB = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "send_msg_b@test.com", password: "securepassword123" }),
      }),
    )
    const dataB = await regB.json()
    const userBId = dataB.data.user.id

    const regOutsider = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "send_msg_outsider@test.com", password: "securepassword123" }),
      }),
    )
    const dataOutsider = await regOutsider.json()
    const tokenOutsider = dataOutsider.data.access_token

    // Create conversation
    const convRes = await app.request(
      new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ targetUserId: userBId }),
      }),
    )
    const convData = await convRes.json()
    const conversationId = convData.data.conversation._id

    await t.step("POST /api/v1/conversations/:id/messages - Fails with empty message text", async () => {
      const req = new Request(`http://localhost/api/v1/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ text: "   " }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
    })

    await t.step(
      "POST /api/v1/conversations/:id/messages - Fails when text exceeds 2000 characters",
      async () => {
        const req = new Request(`http://localhost/api/v1/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({ text: "a".repeat(2001) }),
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
      },
    )

    await t.step(
      "POST /api/v1/conversations/:id/messages - Fails when sender is not a participant",
      async () => {
        const req = new Request(`http://localhost/api/v1/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenOutsider}`,
          },
          body: JSON.stringify({ text: "Intruder message" }),
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.FORBIDDEN.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.FORBIDDEN.code)
      },
    )

    await t.step(
      "POST /api/v1/conversations/:id/messages - Successfully sends message, updates lastMessage, and unhides conversation",
      async () => {
        // Hide conversation for User B before sending message
        await Conversation.findByIdAndUpdate(conversationId, {
          $addToSet: { hiddenFor: userBId },
        })

        const req = new Request(`http://localhost/api/v1/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({ text: "  Hola! Como estas?  " }),
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.CREATED.httpCode)
        assertEquals(payload.success, true)
        assertEquals(payload.code, ApiStatus.CREATED.code)
        assertExists(payload.data.message)
        assertEquals(payload.data.message.text, "Hola! Como estas?")
        assertEquals(payload.data.message.sender, userAId)

        // Verify conversation metadata was updated in DB
        const updatedConv = await Conversation.findById(conversationId)
        assertEquals(updatedConv?.lastMessage?.toString(), payload.data.message._id)
        assertEquals(updatedConv?.hiddenFor.length, 0)
      },
    )

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})