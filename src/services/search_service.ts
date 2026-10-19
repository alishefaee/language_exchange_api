import { User } from "../models/User.ts"
import { SavedSearch, type ISavedSearch } from "../models/SavedSearch.ts"

// Escapes special regex characters to prevent ReDoS attacks from user input
function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export class SearchService {
  static async searchUsers(currentUserId: string, filters: any) {
    const currentUser = await User.findById(currentUserId).select("blockedUsers")
    const blockedIds = currentUser?.blockedUsers || []

    const query: Record<string, any> = {
      _id: { $ne: currentUserId, $nin: blockedIds },
      blockedUsers: { $ne: currentUserId },
      lastUpdatedProfile: { $exists: true, $ne: null }, // Only completed profiles
    }

    // 1. Age Range Filter (Translated to dateOfBirth index)
    if (filters.minAge !== undefined || filters.maxAge !== undefined) {
      const now = new Date()
      query.dateOfBirth = {}

      if (filters.maxAge !== undefined) {
        const oldestBirthDate = new Date(
          now.getFullYear() - (Number(filters.maxAge) + 1),
          now.getMonth(),
          now.getDate(),
        )
        query.dateOfBirth.$gt = oldestBirthDate
      }

      if (filters.minAge !== undefined) {
        const youngestBirthDate = new Date(
          now.getFullYear() - Number(filters.minAge),
          now.getMonth(),
          now.getDate(),
        )
        query.dateOfBirth.$lte = youngestBirthDate
      }
    }

    // 2. Demographic Filters
    if (filters.gender) {
      query.gender = filters.gender
    }
    if (filters.countryOfOrigin) {
      query.countryOfOrigin = filters.countryOfOrigin.toUpperCase()
    }
    if (filters.countryOfResidence) {
      query.countryOfResidence = filters.countryOfResidence.toUpperCase()
    }

    // 3. Single Selectable Native & Learning Language Filters
    if (filters.nativeLanguage) {
      query["nativeLanguages.languageCode"] = filters.nativeLanguage.toLowerCase()
    }
    if (filters.learningLanguage) {
      query["learningLanguages.languageCode"] = filters.learningLanguage.toLowerCase()
    }

    // 4. Space-Separated Bio Keywords Filter
    if (filters.keywords && filters.keywords.trim() !== "") {
      const words = filters.keywords
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(escapeRegex)

      if (words.length > 0) {
        // Matches users whose bio contains ALL space-separated keywords (case-insensitive)
        query.$and = words.map((word: string) => ({
          bio: { $regex: word, $options: "i" },
        }))
      }
    }

    const page = Number(filters.page) || 1
    const limit = Number(filters.limit) || 20
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-passwordHash -blockedUsers -email")
        .sort({ lastLogin: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ])

    return {
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Saves a new search preset for the user.
   */
  static async createSavedSearch(userId: string, data: Partial<ISavedSearch>) {
    const savedSearch = new SavedSearch({
      ...data,
      userId,
    })
    await savedSearch.save()
    return savedSearch
  }

  /**
   * Retrieves all saved searches belonging to the user.
   */
  static async getSavedSearches(userId: string) {
    return await SavedSearch.find({ userId }).sort({ createdAt: -1 })
  }

  /**
   * Updates an existing saved search owned by the user.
   */
  static async updateSavedSearch(userId: string, searchId: string, data: Partial<ISavedSearch>) {
    const updated = await SavedSearch.findOneAndUpdate(
      { _id: searchId, userId },
      { $set: data },
      { new: true, runValidators: true },
    )

    if (!updated) {
      throw new Error("SEARCH_NOT_FOUND")
    }

    return updated
  }

  /**
   * Deletes a saved search owned by the user.
   */
  static async deleteSavedSearch(userId: string, searchId: string) {
    const result = await SavedSearch.deleteOne({ _id: searchId, userId })

    if (result.deletedCount === 0) {
      throw new Error("SEARCH_NOT_FOUND")
    }
  }
}