import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId
  sender: mongoose.Types.ObjectId
  text: string
  createdAt: Date
  updatedAt: Date
}

export const MessageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true, maxlength: 2000, trim: true },
  },
  { timestamps: true },
)

MessageSchema.index({ conversationId: 1, createdAt: -1 })

export const Message: Model<IMessage> = mongoose.model<IMessage>("Message", MessageSchema)
