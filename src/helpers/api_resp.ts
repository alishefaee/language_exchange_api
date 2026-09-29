import type { Context } from "hono"
import { ApiStatus, type ApiStatusKey } from "./api_status.ts"

export interface ApiResponse<T = null> {
  success: boolean
  code: number
  data?: T | undefined
  message?: string | undefined
}

export const reply = {
  /**
   * Generates a successful API response (HTTP 200-299)
   */
  success<T>(c: Context, statusKey: ApiStatusKey, data?: T) {
    const status = ApiStatus[statusKey]

    const response: ApiResponse<T> = {
      success: true,
      code: status.code,
      data,
    }

    return c.json(response, status.httpCode as any)
  },

  /**
   * Generates an error API response (HTTP 400-500)
   */
  error<T>(
    c: Context,
    statusKey: ApiStatusKey,
    data?: T,
  ) {
    const status = ApiStatus[statusKey]

    const response: ApiResponse<T> = {
      success: false,
      code: status.code,
      message: statusKey,
      data,
    }

    return c.json(response, status.httpCode as any)
  },
}
