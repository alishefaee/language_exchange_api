import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface ISavedSearch extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  minAge?: number
  maxAge?: number
  gender?: "male" | "female" | "non-binary" | "other" | "prefer_not_to_say"
  countryOfOrigin?: string
  countryOfResidence?: string
  nativeLanguage?: string
  learningLanguage?: string
  keywords?: string
  createdAt: Date
  updatedAt: Date
}

export const SavedSearchSchema = new Schema<ISavedSearch>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    minAge: { type: Number, min: 13, max: 120 },
    maxAge: { type: Number, min: 13, max: 120 },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
    },
    countryOfOrigin: { type: String, uppercase: true, trim: true },
    countryOfResidence: { type: String, uppercase: true, trim: true },
    nativeLanguage: { type: String, lowercase: true, trim: true }, // Only one selectable
    learningLanguage: { type: String, lowercase: true, trim: true }, // Only one selectable
    keywords: { type: String, trim: true, maxlength: 100 }, // Space-separated bio keywords
  },
  {
    timestamps: true,
    toJSON: { versionKey: false },
  },
)

export const SavedSearch: Model<ISavedSearch> = mongoose.model<ISavedSearch>(
  "SavedSearch",
  SavedSearchSchema,
)
