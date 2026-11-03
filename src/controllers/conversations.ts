import type { Context } from "hono"
import { getLogger } from "@std/log"
import type { AppEnv } from "../types/index.d.ts"
import { ConversationService } from "../services/conversation_service.ts"
import { reply } from "../helpers/api_resp.ts"

const logger = getLogger()

export const getConversations = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const { page, limit } = c.req.query()
    const pageNum = page ? Number(page) : undefined
    const limitNum = limit ? Number(limit) : undefined

    const result = await ConversationService.getUserConversations(userId, pageNum, limitNum)
    return reply.success(c, "OK", result)
  } catch (error: any) {
    logger.error(`Get Conversations Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const createConversation = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const { targetUserId } = await c.req.json<{ targetUserId: string }>()

    const { conversation, isNew } = await ConversationService.createOrGetConversation(
      userId,
      targetUserId,
    )

    return reply.success(c, isNew ? "CREATED" : "OK", { conversation })
  } catch (error: any) {
    if (error.message === "SELF_CONVERSATION") {
      return reply.error(c, "BAD_REQUEST", {
        message: "Cannot create a conversation with yourself.",
      })
    }
    if (error.message === "TARGET_USER_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", {
        message: "Target user does not exist.",
      })
    }
    if (error.message === "USER_BLOCKED") {
      return reply.error(c, "FORBIDDEN", {
        message: "Cannot start a conversation with this user.",
      })
    }

    logger.error(`Create Conversation Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const deleteConversation = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const conversationId = c.req.param("id")!
    await ConversationService.hideConversationForUser(conversationId, userId)

    return reply.success(c, "OK", {
      message: "Conversation history cleared.",
    })
  } catch (error: any) {
    if (error.message === "CONVERSATION_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", {
        message: "Conversation not found.",
      })
    }
    if (error.message === "FORBIDDEN_ACCESS") {
      return reply.error(c, "FORBIDDEN", {
        message: "You are not a participant of this conversation.",
      })
    }

    logger.error(`Delete Conversation Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const getConversationMessages = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const conversationId = c.req.param("id")!
    const { limit, before } = c.req.query()
    const limitNum = limit ? Number(limit) : undefined

    const messages = await ConversationService.getMessages(
      conversationId,
      userId,
      limitNum,
      before,
    )

    return reply.success(c, "OK", { messages })
  } catch (error: any) {
    if (error.message === "CONVERSATION_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", {
        message: "Conversation not found.",
      })
    }
    if (error.message === "FORBIDDEN_ACCESS") {
      return reply.error(c, "FORBIDDEN", {
        message: "You are not a participant of this conversation.",
      })
    }

    logger.error(`Get Messages Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const sendConversationMessage = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const conversationId = c.req.param("id")!
    const { text } = await c.req.json<{ text: string }>()

    const message = await ConversationService.sendMessage(conversationId, userId, text)

    return reply.success(c, "CREATED", { message })
  } catch (error: any) {
    if (error.message === "CONVERSATION_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", {
        message: "Conversation not found.",
      })
    }
    if (error.message === "FORBIDDEN_ACCESS") {
      return reply.error(c, "FORBIDDEN", {
        message: "You are not a participant of this conversation.",
      })
    }

    logger.error(`Send Message Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}
