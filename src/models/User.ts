import mongoose, { type Document, type Model, Schema } from "mongoose"

export interface ILanguageLevel {
  languageCode: string
  proficiency: "beginner" | "intermediate" | "advanced" | "fluent" | "native"
}

export interface IUser extends Document {
  username: string
  email: string
  passwordHash: string
  bio?: string
  avatarUrl?: string

  // Demographics (Optional at initial registration)
  dateOfBirth?: Date
  age?: number
  gender?: "male" | "female" | "non-binary" | "other" | "prefer_not_to_say"
  religion?: string
  countryOfOrigin?: string
  countryOfResidence?: string

  // Languages
  nativeLanguages: ILanguageLevel[]
  learningLanguages: ILanguageLevel[]

  // Activity & Lifecycle
  lastLogin: Date
  lastUpdatedProfile?: Date
  onboardingStep: "identity" | "locations" | "languages" | "avatar" | "completed"

  // Moderation
  blockedUsers: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const LanguageLevelSchema = new Schema<ILanguageLevel>(
  {
    languageCode: { type: String, required: true, lowercase: true, trim: true },
    proficiency: {
      type: String,
      required: true,
      enum: ["beginner", "intermediate", "advanced", "fluent", "native"],
    },
  },
  { _id: false },
)

export const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true, index: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    bio: { type: String, maxlength: 300, default: "" },
    avatarUrl: { type: String, default: null },

    // Removed 'required: true' to allow progressive multi-step onboarding
    dateOfBirth: { type: Date, index: true },
    gender: {
      type: String,
      enum: ["male", "female", "non-binary", "other", "prefer_not_to_say"],
      index: true,
    },
    religion: { type: String, default: null, index: true },
    countryOfOrigin: { type: String, uppercase: true, index: true },
    countryOfResidence: { type: String, uppercase: true, index: true },

    nativeLanguages: { type: [LanguageLevelSchema], default: [] },
    learningLanguages: { type: [LanguageLevelSchema], default: [] },

    lastLogin: { type: Date, default: Date.now, index: true },
    lastUpdatedProfile: { type: Date, index: true }, // Undefined for incomplete profiles
    onboardingStep: {
      type: String,
      enum: ["identity", "locations", "languages", "avatar", "completed"],
      default: "identity",
    },

    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
)

UserSchema.virtual("age").get(function (this: IUser) {
  if (!this.dateOfBirth) return undefined
  const diffMs = Date.now() - this.dateOfBirth.getTime()
  const ageDate = new Date(diffMs)
  return Math.abs(ageDate.getUTCFullYear() - 1970)
})

UserSchema.index({
  lastUpdatedProfile: 1,
  "nativeLanguages.languageCode": 1,
  countryOfResidence: 1,
})
UserSchema.index({ lastUpdatedProfile: 1, "learningLanguages.languageCode": 1 })
UserSchema.index({ lastUpdatedProfile: 1, dateOfBirth: 1, gender: 1 })
UserSchema.index({ lastLogin: -1 })

export const User: Model<IUser> = mongoose.model<IUser>("User", UserSchema)
