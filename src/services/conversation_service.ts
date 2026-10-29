import mongoose from "mongoose"
import { Conversation } from "../models/Conversation.ts"
import { Message } from "../models/Message.ts"
import { User } from "../models/User.ts"

export class ConversationService {
  /**
   * Retrieves a paginated list of active conversations for the user.
   * Excludes conversations where the user is in the hiddenFor array.
   */
  static async getUserConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const query = {
      participants: userId,
      hiddenFor: { $ne: userId },
    }

    const [conversations, total] = await Promise.all([
      Conversation.find(query)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("participants", "username avatarUrl lastLogin")
        .populate("lastMessage", "text sender createdAt"),
      Conversation.countDocuments(query),
    ])

    return {
      conversations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Creates a new conversation between two users or returns the existing one.
   */
  static async createOrGetConversation(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new Error("SELF_CONVERSATION")
    }

    // Verify target user exists and check block status
    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId).select("blockedUsers"),
      User.findById(targetUserId).select("blockedUsers"),
    ])

    if (!targetUser) {
      throw new Error("TARGET_USER_NOT_FOUND")
    }

    const isBlockedByCurrent = currentUser?.blockedUsers?.some(
      (id) => id.toString() === targetUserId,
    )
    const isBlockedByTarget = targetUser.blockedUsers?.some(
      (id) => id.toString() === currentUserId,
    )

    if (isBlockedByCurrent || isBlockedByTarget) {
      throw new Error("USER_BLOCKED")
    }

    // Check if a 1-on-1 conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, targetUserId], $size: 2 },
    })

    if (conversation) {
      // If the user previously hid this chat, unhide it for them
      const isHidden = conversation.hiddenFor.some((id) => id.toString() === currentUserId)
      if (isHidden) {
        conversation.hiddenFor = conversation.hiddenFor.filter(
          (id) => id.toString() !== currentUserId,
        )
        await conversation.save()
      }
      return { conversation, isNew: false }
    }

    // Create new conversation
    conversation = await Conversation.create({
      participants: [currentUserId, targetUserId],
      lastMessageAt: new Date(),
      hiddenFor: [],
    })

    return { conversation, isNew: true }
  }

  /**
   * Hides the conversation for the requesting user without deleting it for the partner.
   */
  static async hideConversationForUser(conversationId: string, userId: string) {
    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      throw new Error("CONVERSATION_NOT_FOUND")
    }

    const isParticipant = conversation.participants.some((id) => id.toString() === userId)
    if (!isParticipant) {
      throw new Error("FORBIDDEN_ACCESS")
    }

    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { hiddenFor: userId },
    })
  }

  /**
   * Retrieves a cursor-paginated list of messages for a specific conversation.
   */
  static async getMessages(
    conversationId: string,
    userId: string,
    limit = 50,
    beforeId?: string,
  ) {
    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      throw new Error("CONVERSATION_NOT_FOUND")
    }

    const isParticipant = conversation.participants.some((id) => id.toString() === userId)
    if (!isParticipant) {
      throw new Error("FORBIDDEN_ACCESS")
    }

    const query: Record<string, any> = { conversationId }

    // Cursor pagination: fetch messages older than the 'before' message ID
    if (beforeId) {
      query._id = { $lt: new mongoose.Types.ObjectId(beforeId) }
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)

    return messages
  }

  /**
   * Sends a message within a conversation and updates the conversation's metadata.
   */
  static async sendMessage(conversationId: string, senderId: string, text: string) {
    const conversation = await Conversation.findById(conversationId)

    if (!conversation) {
      throw new Error("CONVERSATION_NOT_FOUND")
    }

    const isParticipant = conversation.participants.some((id) => id.toString() === senderId)
    if (!isParticipant) {
      throw new Error("FORBIDDEN_ACCESS")
    }

    const message = await Message.create({
      conversationId,
      sender: senderId,
      text,
    })

    // Update conversation's lastMessage and unhide chat for all participants
    conversation.lastMessage = message._id as mongoose.Types.ObjectId
    conversation.lastMessageAt = message.createdAt
    conversation.hiddenFor = []
    await conversation.save()

    return message
  }
}