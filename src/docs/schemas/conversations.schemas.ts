const MessageItem = {
  type: "object",
  properties: {
    _id: { type: "string", example: "671b8a1f2c9d4e5f6a7b8c9d" },
    conversationId: { type: "string", example: "671b89012c9d4e5f6a7b8c00" },
    sender: { type: "string", example: "6ac9fd2581460a82416fa4aa" },
    text: { type: "string", example: "Hello! Would you like to practice Spanish?" },
    createdAt: { type: "string", format: "date-time", example: "2026-10-25T10:15:30.000Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-10-25T10:15:30.000Z" },
  },
}

const PopulatedParticipantItem = {
  type: "object",
  properties: {
    _id: { type: "string", example: "6ac9fd2581460a82416fa4aa" },
    username: { type: "string", example: "alex_lang" },
    avatarUrl: { type: "string", format: "uri", example: "https://cdn.example.com/avatars/alex.jpg" },
    lastLogin: { type: "string", format: "date-time", example: "2026-10-25T09:00:00.000Z" },
  },
}

const PopulatedLastMessageItem = {
  type: "object",
  nullable: true,
  properties: {
    _id: { type: "string", example: "671b8a1f2c9d4e5f6a7b8c9d" },
    text: { type: "string", example: "Hello! Would you like to practice Spanish?" },
    sender: { type: "string", example: "6ac9fd2581460a82416fa4aa" },
    createdAt: { type: "string", format: "date-time", example: "2026-10-25T10:15:30.000Z" },
  },
}

const ConversationPopulatedItem = {
  type: "object",
  properties: {
    _id: { type: "string", example: "671b89012c9d4e5f6a7b8c00" },
    participants: {
      type: "array",
      items: PopulatedParticipantItem,
    },
    lastMessage: PopulatedLastMessageItem,
    lastMessageAt: { type: "string", format: "date-time", example: "2026-10-25T10:15:30.000Z" },
    hiddenFor: {
      type: "array",
      items: { type: "string", example: "6ac9fd2581460a82416fa4bb" },
    },
    createdAt: { type: "string", format: "date-time", example: "2026-10-25T10:00:00.000Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-10-25T10:15:30.000Z" },
  },
}

const ConversationRawItem = {
  type: "object",
  properties: {
    _id: { type: "string", example: "671b89012c9d4e5f6a7b8c00" },
    participants: {
      type: "array",
      items: { type: "string", example: "6ac9fd2581460a82416fa4aa" },
    },
    lastMessage: { type: "string", nullable: true, example: "671b8a1f2c9d4e5f6a7b8c9d" },
    lastMessageAt: { type: "string", format: "date-time", example: "2026-10-25T10:00:00.000Z" },
    hiddenFor: {
      type: "array",
      items: { type: "string" },
      example: [],
    },
    createdAt: { type: "string", format: "date-time", example: "2026-10-25T10:00:00.000Z" },
    updatedAt: { type: "string", format: "date-time", example: "2026-10-25T10:00:00.000Z" },
  },
}

export const conversationSchemas = {
  // --- Request Bodies ---
  CreateConversationRequest: {
    type: "object",
    required: ["targetUserId"],
    properties: {
      targetUserId: {
        type: "string",
        pattern: "^[0-9a-fA-F]{24}$",
        description: "24-character MongoDB ObjectId of the user to start a conversation with.",
        example: "6ac9fd2581460a82416fa4bb",
      },
    },
  },

  SendMessageRequest: {
    type: "object",
    required: ["text"],
    properties: {
      text: {
        type: "string",
        minLength: 1,
        maxLength: 2000,
        description: "Text content of the message (trimmed, 1-2000 characters).",
        example: "Hello! Would you like to practice Spanish?",
      },
    },
  },

  // --- Success Responses ---
  GetConversationsSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          conversations: {
            type: "array",
            items: ConversationPopulatedItem,
          },
          pagination: {
            type: "object",
            properties: {
              total: { type: "integer", example: 1 },
              page: { type: "integer", example: 1 },
              limit: { type: "integer", example: 20 },
              totalPages: { type: "integer", example: 1 },
            },
          },
        },
      },
    },
  },

  CreateConversation201: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1001 },
      data: {
        type: "object",
        properties: {
          conversation: ConversationRawItem,
        },
      },
    },
  },

  CreateConversation200: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          conversation: ConversationRawItem,
        },
      },
    },
  },

  DeleteConversationSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Conversation history cleared." },
        },
      },
    },
  },

  GetMessagesSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1000 },
      data: {
        type: "object",
        properties: {
          messages: {
            type: "array",
            items: MessageItem,
          },
        },
      },
    },
  },

  SendMessageSuccess: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      code: { type: "integer", example: 1001 },
      data: {
        type: "object",
        properties: {
          message: MessageItem,
        },
      },
    },
  },

  // --- Error Responses ---
  ValidationError400: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3001 },
      message: { type: "string", example: "VALIDATION_FAILED" },
      data: {
        type: "object",
        additionalProperties: {
          type: "array",
          items: { type: "string" },
        },
        example: {
          id: ["Invalid ID format."],
        },
      },
    },
  },

  SelfConversation400: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3000 },
      message: { type: "string", example: "BAD_REQUEST" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Cannot create a conversation with yourself." },
        },
      },
    },
  },

  Unauthorized401: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 2000 },
      message: { type: "string", example: "UNAUTHORIZED" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Missing or invalid Authorization header" },
        },
      },
    },
  },

  ForbiddenParticipant403: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 2001 },
      message: { type: "string", example: "FORBIDDEN" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "You are not a participant of this conversation." },
        },
      },
    },
  },

  ForbiddenBlocked403: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 2001 },
      message: { type: "string", example: "FORBIDDEN" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Cannot start a conversation with this user." },
        },
      },
    },
  },

  ConversationNotFound404: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3002 },
      message: { type: "string", example: "RESOURCE_NOT_FOUND" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Conversation not found." },
        },
      },
    },
  },

  TargetUserNotFound404: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 3002 },
      message: { type: "string", example: "RESOURCE_NOT_FOUND" },
      data: {
        type: "object",
        properties: {
          message: { type: "string", example: "Target user does not exist." },
        },
      },
    },
  },

  InternalError500: {
    type: "object",
    properties: {
      success: { type: "boolean", example: false },
      code: { type: "integer", example: 5000 },
      message: { type: "string", example: "INTERNAL_ERROR" },
    },
  },
}