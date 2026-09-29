import type { Context } from "hono"
// --- Conversations Controllers ---
export const getConversations = async (_c: Context) => {
  // TODO: Implement fetch paginated list of conversations
}

export const createConversation = async (_c: Context) => {
  // TODO: Implement create new conversation
}

export const deleteConversation = async (_c: Context) => {
  // TODO: Implement clear chat history for the current user
}

export const getConversationMessages = async (_c: Context) => {
  // TODO: Implement fetch paginated messages for a conversation
}

export const sendConversationMessage = async (_c: Context) => {
  // TODO: Implement send new message
}
