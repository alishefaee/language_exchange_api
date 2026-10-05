export type JwtPayload = {
  sub: string
  iat: number
  exp: number
}

// Hono expects a specific structure for custom environment types
export type AppEnv = {
  Variables: {
    jwtPayload: JwtPayload
  }
}
