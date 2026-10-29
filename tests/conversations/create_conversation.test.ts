// tests/conversations/create_conversation.test.ts
import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"
import { User } from "../../src/models/User.ts"

Deno.test({
  name: "Conversations API - Create Conversation",
  async fn(t) {
    await setupTestDB()

    const regA = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "create_conv_a@test.com", password: "securepassword123" }),
      }),
    )
    const dataA = await regA.json()
    const tokenA = dataA.data.access_token
    const userAId = dataA.data.user.id

    const regB = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "create_conv_b@test.com", password: "securepassword123" }),
      }),
    )
    const dataB = await regB.json()
    const userBId = dataB.data.user.id

    const regBlocked = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "blocked_user@test.com", password: "securepassword123" }),
      }),
    )
    const dataBlocked = await regBlocked.json()
    const blockedUserId = dataBlocked.data.user.id

    await t.step("POST /api/v1/conversations/ - Fails without authentication", async () => {
      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: userBId }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
    })

    await t.step("POST /api/v1/conversations/ - Fails with invalid targetUserId format", async () => {
      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ targetUserId: "invalid-id" }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
    })

    await t.step("POST /api/v1/conversations/ - Fails when creating conversation with oneself", async () => {
      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ targetUserId: userAId }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.BAD_REQUEST.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.BAD_REQUEST.code)
      assertEquals(payload.data.message, "Cannot create a conversation with yourself.")
    })

    await t.step("POST /api/v1/conversations/ - Fails when target user does not exist", async () => {
      const nonExistentId = "6ac9fd2581460a82416fa499"
      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ targetUserId: nonExistentId }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.RESOURCE_NOT_FOUND.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.RESOURCE_NOT_FOUND.code)
    })

    await t.step("POST /api/v1/conversations/ - Fails when either user has blocked the other", async () => {
      await User.findByIdAndUpdate(userAId, {
        $addToSet: { blockedUsers: blockedUserId },
      })

      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ targetUserId: blockedUserId }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.FORBIDDEN.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.FORBIDDEN.code)
    })

    let createdConversationId = ""

    await t.step("POST /api/v1/conversations/ - Successfully creates a new conversation (201)", async () => {
      const req = new Request("http://localhost/api/v1/conversations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenA}`,
        },
        body: JSON.stringify({ targetUserId: userBId }),
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.CREATED.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.CREATED.code)
      assertExists(payload.data.conversation)
      assertEquals(payload.data.conversation.participants.length, 2)

      createdConversationId = payload.data.conversation._id
    })

    await t.step(
      "POST /api/v1/conversations/ - Returns existing conversation (200) and unhides it if previously hidden",
      async () => {
        // Hide the conversation first
        await app.request(
          new Request(`http://localhost/api/v1/conversations/${createdConversationId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${tokenA}` },
          }),
        )

        // Calling POST again should return 200 OK and remove userAId from hiddenFor
        const req = new Request("http://localhost/api/v1/conversations/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({ targetUserId: userBId }),
        })

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.success, true)
        assertEquals(payload.code, ApiStatus.OK.code)
        assertEquals(payload.data.conversation._id, createdConversationId)
        assertEquals(payload.data.conversation.hiddenFor.includes(userAId), false)
      },
    )

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})