// tests/messages/delete_message.test.ts
import { assertEquals, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"
import { Conversation } from "../../src/models/Conversation.ts"
import { Message } from "../../src/models/Message.ts"

Deno.test({
  name: "Messages API - Delete Message",
  async fn(t) {
    await setupTestDB()

    const regA = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "del_msg_a@test.com", password: "securepassword123" }),
      }),
    )
    const dataA = await regA.json()
    const tokenA = dataA.data.access_token

    const regB = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "del_msg_b@test.com", password: "securepassword123" }),
      }),
    )
    const dataB = await regB.json()
    const tokenB = dataB.data.access_token
    const userBId = dataB.data.user.id

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

    // Send two messages from User A
    const msg1Res = await app.request(
      new Request(`http://localhost/api/v1/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ text: "First message" }),
      }),
    )
    const msg1Data = await msg1Res.json()
    const firstMessageId = msg1Data.data.message._id

    const msg2Res = await app.request(
      new Request(`http://localhost/api/v1/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ text: "Second message" }),
      }),
    )
    const msg2Data = await msg2Res.json()
    const secondMessageId = msg2Data.data.message._id

    await t.step("DELETE /api/v1/messages/:id - Fails with invalid message ID format", async () => {
      const req = new Request("http://localhost/api/v1/messages/invalid-id", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenA}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
    })

    await t.step("DELETE /api/v1/messages/:id - Fails when message does not exist", async () => {
      const req = new Request("http://localhost/api/v1/messages/671b8a1f2c9d4e5f6a7b8c99", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenA}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.RESOURCE_NOT_FOUND.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.RESOURCE_NOT_FOUND.code)
    })

    await t.step(
      "DELETE /api/v1/messages/:id - Fails when non-sender participant tries to delete message",
      async () => {
        const req = new Request(`http://localhost/api/v1/messages/${secondMessageId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenB}` },
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.FORBIDDEN.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.FORBIDDEN.code)
        assertEquals(payload.data.message, "You can only delete your own messages.")
      },
    )

    await t.step(
      "DELETE /api/v1/messages/:id - Hard-deletes latest message and updates conversation lastMessage pointer",
      async () => {
        const req = new Request(`http://localhost/api/v1/messages/${secondMessageId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenA}` },
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.success, true)
        assertEquals(payload.code, ApiStatus.OK.code)
        assertEquals(payload.data.message, "Message permanently deleted.")

        // Verify hard delete in DB
        const deletedMsg = await Message.findById(secondMessageId)
        assertEquals(deletedMsg, null)

        // Verify conversation's lastMessage rolled back to firstMessageId
        const updatedConv = await Conversation.findById(conversationId)
        assertEquals(updatedConv?.lastMessage?.toString(), firstMessageId)
      },
    )

    await t.step(
      "DELETE /api/v1/messages/:id - Clears conversation lastMessage when the final remaining message is deleted",
      async () => {
        const req = new Request(`http://localhost/api/v1/messages/${firstMessageId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenA}` },
        })

        const res = await app.request(req)
        assertEquals(res.status, ApiStatus.OK.httpCode)

        const updatedConv = await Conversation.findById(conversationId)
        assertEquals(updatedConv?.lastMessage, undefined)
      },
    )

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})