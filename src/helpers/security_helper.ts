import bcrypt from "bcryptjs";
import { sign, verify } from "hono/jwt";
// ==========================================
// Password Hashing (Bcrypt)
// ==========================================
const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return await bcrypt.compare(password, hash);
};

// ==========================================
// Token Management (OAuth2 / JWT)
// ==========================================

const JWT_SECRET = Deno.env.get("JWT_SECRET") || "fallback_development_secret_key_12345";
const ACCESS_TOKEN_EXPIRATION_SEC = 3600; // 1 hour
export const REFRESH_TOKEN_EXPIRATION_MS = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds

export const TokenService = {
    /**
     * Generates a short-lived JWT access token for API authorization.
     */
    generateAccessToken: async (userId: string): Promise<string> => {
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            sub: userId,
            iat: now,
            exp: now + ACCESS_TOKEN_EXPIRATION_SEC,
        };

        return await sign(payload, JWT_SECRET);
    },

    /**
     * Generates a long-lived, opaque refresh token.
     * This is stored in the database to maintain device sessions and issue new access tokens.
     */
    generateRefreshToken: (): string => {
        return crypto.randomUUID();
    },

    /**
     * Verifies the cryptographic signature and expiration of an access token.
     * Returns the decoded payload if valid, or null if tampered/expired.
     */
    verifyAccessToken: async (token: string): Promise<any | null> => {
        try {
            const decodedPayload = await verify(token, JWT_SECRET);
            return decodedPayload;
        } catch (error) {
            // Catch SignatureKeyNotFound, JwtTokenInvalid, JwtTokenExpired, etc.
            return null;
        }
    }
};