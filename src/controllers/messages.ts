import type { Context } from "hono"
import { getLogger } from "@std/log"
import type { AppEnv } from "../types/index.d.ts"
import { MessageService } from "../services/message_service.ts"
import { reply } from "../helpers/api_resp.ts"

const logger = getLogger()

export const deleteMessage = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload")?.sub
    if (!userId) return reply.error(c, "UNAUTHORIZED")

    const messageId = c.req.param("id")!
    await MessageService.deleteMessage(messageId, userId)

    return reply.success(c, "OK", {
      message: "Message permanently deleted.",
    })
  } catch (error: any) {
    if (error.message === "MESSAGE_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", {
        message: "Message not found.",
      })
    }
    if (error.message === "FORBIDDEN_ACCESS") {
      return reply.error(c, "FORBIDDEN", {
        message: "You can only delete your own messages.",
      })
    }

    logger.error(`Delete Message Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}