// tests/search/search_users.test.ts
import { assertEquals, assertExists, assertFalse } from "@std/assert"
import { app } from "../../src/app.ts"
import { setupTestDB, teardownTestDB } from "../setup.ts"
import { ApiStatus } from "../../src/helpers/api_status.ts"
import { User } from "../../src/models/User.ts"

Deno.test({
  name: "Search API - Search Users",
  async fn(t) {
    await setupTestDB()

    // 1. Register and authenticate the caller
    const callerRes = await app.request(
      new Request("http://localhost/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "searcher@test.com",
          password: "securepassword123",
        }),
      }),
    )
    const callerData = await callerRes.json()
    const accessToken = callerData.data.access_token

    const now = new Date()
    const dob25 = new Date(now.getFullYear() - 25, now.getMonth(), now.getDate())
    const dob32 = new Date(now.getFullYear() - 32, now.getMonth(), now.getDate())

    // 2. Seed candidate users directly into the test database
    await User.create([
      {
        email: "maria@test.com",
        username: "user10000001",
        passwordHash: "hashed",
        dateOfBirth: dob25,
        gender: "female",
        countryOfOrigin: "BR",
        countryOfResidence: "DE",
        nativeLanguages: [{ languageCode: "pt", proficiency: "native" }],
        learningLanguages: [{ languageCode: "de", proficiency: "intermediate" }],
        bio: "I love indie music, travel, and specialty coffee in Berlin.",
        onboardingStep: "completed",
        lastUpdatedProfile: new Date(),
      },
      {
        email: "kenji@test.com",
        username: "user10000002",
        passwordHash: "hashed",
        dateOfBirth: dob32,
        gender: "male",
        countryOfOrigin: "JP",
        countryOfResidence: "CA",
        nativeLanguages: [{ languageCode: "ja", proficiency: "native" }],
        learningLanguages: [{ languageCode: "en", proficiency: "advanced" }],
        bio: "Software engineer who enjoys hiking, anime, and photography.",
        onboardingStep: "completed",
        lastUpdatedProfile: new Date(),
      },
      {
        email: "incomplete@test.com",
        username: "user10000003",
        passwordHash: "hashed",
        dateOfBirth: dob25,
        gender: "female",
        countryOfOrigin: "BR",
        countryOfResidence: "DE",
        onboardingStep: "identity",
        // Missing lastUpdatedProfile: should be excluded from all search results
      },
    ])

    await t.step("GET /api/v1/search/users - Fails without authentication", async () => {
      const req = new Request("http://localhost/api/v1/search/users", {
        method: "GET",
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.UNAUTHORIZED.httpCode)
      assertFalse(payload.success)
      assertEquals(payload.code, ApiStatus.UNAUTHORIZED.code)
    })

    await t.step("GET /api/v1/search/users - Returns only onboarded users", async () => {
      const req = new Request("http://localhost/api/v1/search/users", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.success, true)
      assertEquals(payload.code, ApiStatus.OK.code)
      assertExists(payload.data.users)
      assertEquals(payload.data.users.length, 2)
      assertEquals(payload.data.pagination.total, 2)
    })

    await t.step("GET /api/v1/search/users - Filters by age range and gender", async () => {
      const req = new Request(
        "http://localhost/api/v1/search/users?minAge=20&maxAge=28&gender=female",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )

      const res = await app.request(req)
      const payload = await res.json()

      assertEquals(res.status, ApiStatus.OK.httpCode)
      assertEquals(payload.data.users.length, 1)
      assertEquals(payload.data.users[0].username, "user10000001")
    })

    await t.step(
      "GET /api/v1/search/users - Filters by origin and residence countries",
      async () => {
        const req = new Request(
          "http://localhost/api/v1/search/users?countryOfOrigin=JP&countryOfResidence=CA",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.data.users.length, 1)
        assertEquals(payload.data.users[0].username, "user10000002")
      },
    )

    await t.step(
      "GET /api/v1/search/users - Filters by single native and learning language",
      async () => {
        const req = new Request(
          "http://localhost/api/v1/search/users?nativeLanguage=pt&learningLanguage=de",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.data.users.length, 1)
        assertEquals(payload.data.users[0].username, "user10000001")
      },
    )

    await t.step(
      "GET /api/v1/search/users - Filters by space-separated keywords in bio",
      async () => {
        const req = new Request(
          "http://localhost/api/v1/search/users?keywords=music%20coffee",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.data.users.length, 1)
        assertEquals(payload.data.users[0].username, "user10000001")
      },
    )

    await t.step(
      "GET /api/v1/search/users - Returns empty array when not all space-separated keywords match",
      async () => {
        const req = new Request(
          "http://localhost/api/v1/search/users?keywords=music%20photography",
          {
            method: "GET",
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )

        const res = await app.request(req)
        const payload = await res.json()

        assertEquals(res.status, ApiStatus.OK.httpCode)
        assertEquals(payload.data.users.length, 0)
      },
    )

    await t.step("GET /api/v1/search/users - Fails validation with invalid query parameters", async () => {
      const req = new Request("http://localhost/api/v1/search/users?minAge=5&gender=invalid", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
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