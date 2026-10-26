import { conversationSchemas } from "../schemas/conversations.schemas.ts"

export const conversationPaths = {
  "/api/v1/conversations/": {
    get: {
      tags: ["Conversations"],
      summary: "Get user conversations",
      description:
        "Retrieves a paginated list of active conversations for the authenticated user, sorted descending by lastMessageAt. Excludes conversations cleared by the user.",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "page",
          in: "query",
          required: false,
          description: "Page number for pagination (minimum 1, default 1).",
          schema: {
            type: "integer",
            minimum: 1,
            default: 1,
            example: 1,
          },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Number of conversations per page (1-50, default 20).",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 50,
            default: 20,
            example: 20,
          },
        },
      ],
      responses: {
        "200": {
          description: "Paginated list of active conversations retrieved successfully",
          content: {
            "application/json": {
              schema: conversationSchemas.GetConversationsSuccess,
            },
          },
        },
        "400": {
          description: "Invalid query parameters",
          content: {
            "application/json": {
              schema: conversationSchemas.ValidationError400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: conversationSchemas.Unauthorized401,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: conversationSchemas.InternalError500,
            },
          },
        },
      },
    },

    post: {
      tags: ["Conversations"],
      summary: "Create or retrieve a 1-on-1 conversation",
      description:
        "Starts a new conversation between the authenticated user and targetUserId, or returns (and unhides) the existing conversation if one already exists.",
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: conversationSchemas.CreateConversationRequest,
          },
        },
      },
      responses: {
        "200": {
          description: "Existing conversation retrieved (and unhidden if previously cleared)",
          content: {
            "application/json": {
              schema: conversationSchemas.CreateConversation200,
            },
          },
        },
        "201": {
          description: "New conversation created successfully",
          content: {
            "application/json": {
              schema: conversationSchemas.CreateConversation201,
            },
          },
        },
        "400": {
          description: "Validation failed or attempted to start a conversation with oneself",
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  conversationSchemas.ValidationError400,
                  conversationSchemas.SelfConversation400,
                ],
              },
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: conversationSchemas.Unauthorized401,
            },
          },
        },
        "403": {
          description: "Forbidden - Either user has blocked the other",
          content: {
            "application/json": {
              schema: conversationSchemas.ForbiddenBlocked403,
            },
          },
        },
        "404": {
          description: "Target user not found",
          content: {
            "application/json": {
              schema: conversationSchemas.TargetUserNotFound404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: conversationSchemas.InternalError500,
            },
          },
        },
      },
    },
  },

  "/api/v1/conversations/{id}": {
    delete: {
      tags: ["Conversations"],
      summary: "Clear conversation history for current user",
      description:
        "Appends the authenticated user's ID to the conversation's hiddenFor array, hiding the conversation for the requester without affecting the other participant.",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "24-character MongoDB ObjectId of the conversation.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "671b89012c9d4e5f6a7b8c00",
          },
        },
      ],
      responses: {
        "200": {
          description: "Conversation hidden for the requesting user",
          content: {
            "application/json": {
              schema: conversationSchemas.DeleteConversationSuccess,
            },
          },
        },
        "400": {
          description: "Invalid conversation ID format",
          content: {
            "application/json": {
              schema: conversationSchemas.ValidationError400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: conversationSchemas.Unauthorized401,
            },
          },
        },
        "403": {
          description: "Forbidden - User is not a participant of this conversation",
          content: {
            "application/json": {
              schema: conversationSchemas.ForbiddenParticipant403,
            },
          },
        },
        "404": {
          description: "Conversation not found",
          content: {
            "application/json": {
              schema: conversationSchemas.ConversationNotFound404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: conversationSchemas.InternalError500,
            },
          },
        },
      },
    },
  },

  "/api/v1/conversations/{id}/messages": {
    get: {
      tags: ["Conversations"],
      summary: "Get messages in a conversation",
      description:
        "Fetches a cursor-paginated list of messages for a specific conversation, sorted newest first (createdAt: -1).",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "24-character MongoDB ObjectId of the conversation.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "671b89012c9d4e5f6a7b8c00",
          },
        },
        {
          name: "limit",
          in: "query",
          required: false,
          description: "Maximum number of messages to return (1-100, default 50).",
          schema: {
            type: "integer",
            minimum: 1,
            maximum: 100,
            default: 50,
            example: 50,
          },
        },
        {
          name: "before",
          in: "query",
          required: false,
          description: "Cursor pagination: 24-character Message ObjectId to fetch messages older than.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "671b8a1f2c9d4e5f6a7b8c9d",
          },
        },
      ],
      responses: {
        "200": {
          description: "List of messages retrieved successfully",
          content: {
            "application/json": {
              schema: conversationSchemas.GetMessagesSuccess,
            },
          },
        },
        "400": {
          description: "Invalid path or query parameters",
          content: {
            "application/json": {
              schema: conversationSchemas.ValidationError400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: conversationSchemas.Unauthorized401,
            },
          },
        },
        "403": {
          description: "Forbidden - User is not a participant of this conversation",
          content: {
            "application/json": {
              schema: conversationSchemas.ForbiddenParticipant403,
            },
          },
        },
        "404": {
          description: "Conversation not found",
          content: {
            "application/json": {
              schema: conversationSchemas.ConversationNotFound404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: conversationSchemas.InternalError500,
            },
          },
        },
      },
    },

    post: {
      tags: ["Conversations"],
      summary: "Send a message in a conversation",
      description:
        "Creates a new text message in the specified conversation, updates lastMessage and lastMessageAt, and unhides the conversation for all participants.",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "24-character MongoDB ObjectId of the conversation.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "671b89012c9d4e5f6a7b8c00",
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: conversationSchemas.SendMessageRequest,
          },
        },
      },
      responses: {
        "201": {
          description: "Message created and sent successfully",
          content: {
            "application/json": {
              schema: conversationSchemas.SendMessageSuccess,
            },
          },
        },
        "400": {
          description: "Invalid conversation ID or message text validation failed",
          content: {
            "application/json": {
              schema: conversationSchemas.ValidationError400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: conversationSchemas.Unauthorized401,
            },
          },
        },
        "403": {
          description: "Forbidden - User is not a participant of this conversation",
          content: {
            "application/json": {
              schema: conversationSchemas.ForbiddenParticipant403,
            },
          },
        },
        "404": {
          description: "Conversation not found",
          content: {
            "application/json": {
              schema: conversationSchemas.ConversationNotFound404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: conversationSchemas.InternalError500,
            },
          },
        },
      },
    },
  },
}