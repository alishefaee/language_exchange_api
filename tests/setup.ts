// tests/setup.ts
import mongoose from "mongoose"

export async function setupTestDB() {
  const MONGODB_URI_TEST = Deno.env.get("MONGODB_URI_TEST")
  if (!MONGODB_URI_TEST) {
    throw new Error("MONGODB_URI_TEST environment variable must be set for tests.")
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI_TEST, {
      // Explicitly define driver metadata to bypass the Deno/MongoDB handshake bug
      driverInfo: { name: "deno", version: "1.0" },
    })
  }
}

export async function teardownTestDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase() // Clears all test data
    await mongoose.disconnect()
  }
}
