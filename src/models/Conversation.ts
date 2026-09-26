import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage?: mongoose.Types.ObjectId;
    lastMessageAt: Date;
    hiddenFor: mongoose.Types.ObjectId[]; // Allows a user to clear chat history without affecting the other
    createdAt: Date;
    updatedAt: Date;
}

export const ConversationSchema = new Schema<IConversation>(
    {
        participants: [
            { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        ],
        lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
        lastMessageAt: { type: Date, default: Date.now, index: true },
        hiddenFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
    },
    { timestamps: true }
);

ConversationSchema.index({ participants: 1 });

export const Conversation: Model<IConversation> = mongoose.model<IConversation>(
    "Conversation",
    ConversationSchema
);