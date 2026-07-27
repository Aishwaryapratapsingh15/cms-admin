export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// Backend's default REFRESH_TOKEN_EXPIRES_IN (see cms-backend/.env); the refresh
// token itself is opaque so we can't read an expiry out of it like the JWT.
export const REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const API_URL = process.env.API_URL ?? "http://localhost:3000/api/v1";

export const ROLES = {
  ADMIN: "ADMIN",
  EDITOR: "EDITOR",
  AUTHOR: "AUTHOR",
} as const;
