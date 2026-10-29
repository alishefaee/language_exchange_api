import { messageSchemas } from "../schemas/messages.schemas.ts"

export const messagePaths = {
  "/api/v1/messages/{id}": {
    delete: {
      tags: ["Messages"],
      summary: "Delete a message for everyone",
      description:
        "Hard-deletes a message document for all participants. Only the original sender of the message is authorized to delete it. If the deleted message was the conversation's lastMessage, the pointer is updated to the preceding message.",
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "24-character MongoDB ObjectId of the message to delete.",
          schema: {
            type: "string",
            pattern: "^[0-9a-fA-F]{24}$",
            example: "671b8a1f2c9d4e5f6a7b8c9d",
          },
        },
      ],
      responses: {
        "200": {
          description: "Message permanently deleted",
          content: {
            "application/json": {
              schema: messageSchemas.DeleteMessageSuccess,
            },
          },
        },
        "400": {
          description: "Invalid message ID format",
          content: {
            "application/json": {
              schema: messageSchemas.ValidationError400,
            },
          },
        },
        "401": {
          description: "Unauthorized - Missing or invalid Bearer token",
          content: {
            "application/json": {
              schema: messageSchemas.Unauthorized401,
            },
          },
        },
        "403": {
          description: "Forbidden - Authenticated user is not the sender of this message",
          content: {
            "application/json": {
              schema: messageSchemas.ForbiddenSender403,
            },
          },
        },
        "404": {
          description: "Message not found",
          content: {
            "application/json": {
              schema: messageSchemas.MessageNotFound404,
            },
          },
        },
        "500": {
          description: "Internal server error",
          content: {
            "application/json": {
              schema: messageSchemas.InternalError500,
            },
          },
        },
      },
    },
  },
}