// tests/conversations/delete_conversation.test.ts
import { assertEquals, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"
import { Conversation } from "../../src/models/Conversation.ts"

Deno.test({
  name: "Conversations API - Delete (Hide) Conversation",
  async fn(t) {
    await setupTestDB()

    const regA = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "del_conv_a@test.com", password: "securepassword123" }),
      }),
    )
    const dataA = await regA.json()
    const tokenA = dataA.data.access_token
    const userAId = dataA.data.user.id

    const regB = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "del_conv_b@test.com", password: "securepassword123" }),
      }),
    )
    const dataB = await regB.json()
    const tokenB = dataB.data.access_token
    const userBId = dataB.data.user.id

    const regOutsider = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "del_conv_outsider@test.com", password: "securepassword123" }),
      }),
    )
    const dataOutsider = await regOutsider.json()
    const tokenOutsider = dataOutsider.data.access_token

    // Seed a conversation between User A and User B
    const createRes = await app.request(
      new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ targetUserId: userBId }),
      }),
    )
    const createData = await createRes.json()
    const conversationId = createData.data.conversation._id

    await t.step("DELETE /api/v1/conversations/:id - Fails with invalid ID format", async () => {
      const req = new Request("http://localhost/api/v1/conversations/not-an-objectid", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokenA}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
    })

    await t.step("DELETE /api/v1/conversations/:id - Fails when conversation does not exist", async () => {
      const req = new Request("http://localhost/api/v1/conversations/671b89012c9d4e5f6a7b8c99", {
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
      "DELETE /api/v1/conversations/:id - Fails when requester is not a participant",
      async () => {
        const req = new Request(`http://localhost/api/v1/conversations/${conversationId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenOutsider}` },
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.FORBIDDEN.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.FORBIDDEN.code)
      },
    )

    await t.step(
      "DELETE /api/v1/conversations/:id - Hides conversation for requester while keeping it visible for partner",
      async () => {
        const req = new Request(`http://localhost/api/v1/conversations/${conversationId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${tokenA}` },
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.success, true)
        assertEquals(payload.code, ApiStatus.OK.code)
        assertEquals(payload.data.message, "Conversation history cleared.")

        // Verify in DB that hiddenFor contains userAId
        const dbConv = await Conversation.findById(conversationId)
        assertEquals(
          dbConv?.hiddenFor.some((id) => id.toString() === userAId),
          true,
        )

        // Verify User B still sees the conversation in their list
        const listBRes = await app.request(
          new Request("http://localhost/api/v1/conversations/", {
            method: "GET",
            headers: { Authorization: `Bearer ${tokenB}` },
          }),
        )
        const listBData = await listBRes.json()
        assertEquals(listBData.data.conversations.length, 1)
      },
    )

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})