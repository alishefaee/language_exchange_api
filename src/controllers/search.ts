import type { Context } from "hono"
import { AppEnv } from "../types/index.d.ts"
import { SearchService } from "../services/search_service.ts"
import { reply } from "../helpers/api_resp.ts"
import { getLogger } from "@std/log"

const logger = getLogger()

export const searchUsers = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const queryParams = c.req.query()
    const result = await SearchService.searchUsers(userId, queryParams)

    return reply.success(c, "OK", result)
  } catch (error: any) {
    logger.error(`Search Users Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const createSavedSearch = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const payload = await c.req.json()
    const savedSearch = await SearchService.createSavedSearch(userId, payload)

    return reply.success(c, "CREATED", { savedSearch })
  } catch (error: any) {
    logger.error(`Create Saved Search Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const getSavedSearches = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const savedSearches = await SearchService.getSavedSearches(userId)

    return reply.success(c, "OK", { savedSearches })
  } catch (error: any) {
    logger.error(`Get Saved Searches Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const updateSavedSearch = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const searchId = c.req.param("id")!
    const payload = await c.req.json()

    const savedSearch = await SearchService.updateSavedSearch(userId, searchId, payload)

    return reply.success(c, "OK", { savedSearch })
  } catch (error: any) {
    if (error.message === "SEARCH_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", { message: "Saved search not found." })
    }
    logger.error(`Update Saved Search Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}

export const deleteSavedSearch = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub

    const searchId = c.req.param("id")!
    await SearchService.deleteSavedSearch(userId, searchId)

    return reply.success(c, "OK", { message: "Saved search deleted successfully." })
  } catch (error: any) {
    if (error.message === "SEARCH_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", { message: "Saved search not found." })
    }
    logger.error(`Delete Saved Search Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}