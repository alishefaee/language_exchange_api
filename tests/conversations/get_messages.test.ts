// tests/conversations/get_messages.test.ts
import { assertEquals, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"

Deno.test({
  name: "Conversations API - Get Conversation Messages",
  async fn(t) {
    await setupTestDB()

    const regA = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "msg_list_a@test.com", password: "securepassword123" }),
      }),
    )
    const dataA = await regA.json()
    const tokenA = dataA.data.access_token

    const regB = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "msg_list_b@test.com", password: "securepassword123" }),
      }),
    )
    const dataB = await regB.json()
    const userBId = dataB.data.user.id

    const regOutsider = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "msg_list_outsider@test.com", password: "securepassword123" }),
      }),
    )
    const dataOutsider = await regOutsider.json()
    const tokenOutsider = dataOutsider.data.access_token

    // Create conversation between User A and User B
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

    // Seed 3 messages in order
    for (const text of ["Message 1", "Message 2", "Message 3"]) {
      // deno-lint-ignore no-await-in-loop
      await app.request(
        new Request(`http://localhost/api/v1/conversations/${conversationId}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenA}`,
          },
          body: JSON.stringify({ text }),
        }),
      )
    }

    await t.step(
      "GET /api/v1/conversations/:id/messages - Fails with invalid query or param ID",
      async () => {
        const req = new Request(
          `http://localhost/api/v1/conversations/${conversationId}/messages?before=invalid_cursor`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${tokenA}` },
          },
        )

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.VALIDATION_FAILED.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.VALIDATION_FAILED.code)
      },
    )

    await t.step(
      "GET /api/v1/conversations/:id/messages - Fails when requester is not a participant",
      async () => {
        const req = new Request(
          `http://localhost/api/v1/conversations/${conversationId}/messages`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${tokenOutsider}` },
          },
        )

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.FORBIDDEN.httpCode)
        assertFalse(payload.success)
        assertEquals(payload.code, ApiStatus.FORBIDDEN.code)
      },
    )

    await t.step(
      "GET /api/v1/conversations/:id/messages - Retrieves messages newest first and supports cursor pagination",
      async () => {
        // Fetch newest 2 messages
        const resPage1 = await app.request(
          new Request(
            `http://localhost/api/v1/conversations/${conversationId}/messages?limit=2`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${tokenA}` },
            },
          ),
        )
        const payloadPage1 = await resPage1.json()

        assertEquals(resPage1.status, ApiStatus.OK.httpCode)
        assertEquals(payloadPage1.success, true)
        assertEquals(payloadPage1.data.messages.length, 2)
        assertEquals(payloadPage1.data.messages[0].text, "Message 3")
        assertEquals(payloadPage1.data.messages[1].text, "Message 2")

        // Use the ID of "Message 2" as the `before` cursor to fetch older messages
        const cursorId = payloadPage1.data.messages[1]._id
        const resPage2 = await app.request(
          new Request(
            `http://localhost/api/v1/conversations/${conversationId}/messages?limit=2&before=${cursorId}`,
            {
              method: "GET",
              headers: { Authorization: `Bearer ${tokenA}` },
            },
          ),
        )
        const payloadPage2 = await resPage2.json()

        assertEquals(resPage2.status, ApiStatus.OK.httpCode)
        assertEquals(payloadPage2.data.messages.length, 1)
        assertEquals(payloadPage2.data.messages[0].text, "Message 1")
      },
    )

    await teardownTestDB()
  },
  sanitizeOps: false,
  sanitizeResources: false,
})