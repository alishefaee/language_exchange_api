import type { Context } from "hono"
import { UserService } from "../services/user_service.ts"
import { reply } from "../helpers/api_resp.ts"
import { getLogger } from "@std/log"
import { AppEnv } from "../types/index.d.ts"

const logger = getLogger()

export const completeOnboarding = async (c: Context<AppEnv>) => {
  try {
    const userId = c.get("jwtPayload").sub
    const payload = await c.req.json()
    console.log(payload)

    const updatedUser = await UserService.completeProfile(userId, payload)

    return reply.success(c, "OK", {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        onboardingStep: updatedUser.onboardingStep,
      },
    })
  } catch (error: any) {
    if (error.message === "USER_NOT_FOUND") {
      return reply.error(c, "RESOURCE_NOT_FOUND", { message: "User account no longer exists." })
    }

    logger.error(`Complete Onboarding Error: ${error.message}`)
    return reply.error(c, "INTERNAL_ERROR")
  }
}
