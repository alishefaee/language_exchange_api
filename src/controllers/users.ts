import type { Context } from "hono"
import { UserService } from "../services/user_service.ts"
import { reply } from "../helpers/api_resp.ts"
import { getLogger } from "@std/log"
import { AppEnv } from "../types/index.d.ts"
import { processAvatarImage } from "../helpers/image_processor.ts"

const logger = getLogger()

export const completeOnboarding = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload")?.sub
    if (!userId) {
      return reply.error(c, "UNAUTHORIZED")
    }

    const payload = await c.req.json()
    const updatedUser = await UserService.completeProfile(userId, payload)

    return reply.success(c, "OK", {
      user: updatedUser, // Returns all user fields with `_id`, omitting `passwordHash` and `__v`
    })
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", {
        message: "User account no longer exists.",
      })
    }

    logger.error(`Complete Onboarding Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const uploadAvatar = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub
    const body = await c.req.parseBody()
    const file = body["avatar"] as File

    const uploadDir = "./uploads/avatars"
    await Deno.mkdir(uploadDir, { recursive: true })

    // Preprocess image (or fast-path if already optimized by client)
    const rawBuffer = await file.arrayBuffer()
    const { buffer, ext } = await processAvatarImage(rawBuffer)

    const fileName = `${userId}_${crypto.randomUUID()}.${ext}`
    const filePath = `${uploadDir}/${fileName}`

    await Deno.writeFile(filePath, buffer)

    const baseUrl = Deno.env.get("API_BASE_URL") || new URL(c.req.url).origin
    const avatarUrl = `${baseUrl}/api/v1/uploads/avatars/${fileName}`

    await UserService.updateAvatar(userId, avatarUrl)

    return reply.success(c, "OK", {
      avatarUrl,
      avatarUri: avatarUrl,
    })
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", { message: "User account no longer exists." })
    }
    if (error.message === "INVALID_IMAGE") {
      return reply.error(c, "BAD_REQUEST", { message: "Invalid or corrupted image file." })
    }

    logger.error(`Upload Avatar Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}
