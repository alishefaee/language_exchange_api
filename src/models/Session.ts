import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    refreshToken: string;
    deviceId?: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export const SessionSchema = new Schema<ISession>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        refreshToken: { type: String, required: true, unique: true },
        deviceId: { type: String, default: "unknown" },
        // TTL Index: MongoDB automatically removes the document when expiresAt is reached
        expiresAt: { type: Date, required: true, index: { expires: "0s" } },
    },
    { timestamps: true }
);

export const Session: Model<ISession> = mongoose.model<ISession>("Session", SessionSchema);