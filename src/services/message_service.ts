import mongoose from "mongoose"
import { Message } from "../models/Message.ts"
import { Conversation } from "../models/Conversation.ts"

export class MessageService {
  /**
   * Hard deletes a message for everyone (only allowed by the sender).
   */
  static async deleteMessage(messageId: string, userId: string) {
    const message = await Message.findById(messageId)

    if (!message) {
      throw new Error("MESSAGE_NOT_FOUND")
    }

    // Ensure only the sender can delete their own message
    if (message.sender.toString() !== userId) {
      throw new Error("FORBIDDEN_ACCESS")
    }

    const conversationId = message.conversationId
    await Message.deleteOne({ _id: messageId })

    // If this message was the conversation's lastMessage, update the pointer to the previous message
    const conversation = await Conversation.findById(conversationId)
    if (conversation && conversation.lastMessage?.toString() === messageId) {
      const previousMessage = await Message.findOne({ conversationId }).sort({ createdAt: -1 })

      conversation.lastMessage = previousMessage
        ? (previousMessage._id as mongoose.Types.ObjectId)
        : undefined

      if (previousMessage) {
        conversation.lastMessageAt = previousMessage.createdAt
      }

      await conversation.save()
    }
  }
}