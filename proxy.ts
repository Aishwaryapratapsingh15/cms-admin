import { NextRequest, NextResponse } from "next/server";
import { decodeAccessToken, isAccessTokenExpired } from "@/lib/jwt";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
  API_URL,
} from "@/lib/constants";

const PUBLIC_PATHS = ["/login"];

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

async function refreshTokens(refreshToken: string) {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = await res.json();
    if (!body.success) return null;
    return body.data as { accessToken: string; refreshToken: string };
  } catch {
    return null;
  }
}

function accessTokenMaxAge(accessToken: string): number {
  const payload = decodeAccessToken(accessToken);
  if (!payload?.exp) return 0;
  return Math.max(1, payload.exp - Math.floor(Date.now() / 1000));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  let accessToken = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

  let response: NextResponse | undefined;

  if ((!accessToken || isAccessTokenExpired(accessToken)) && refreshToken) {
    const refreshed = await refreshTokens(refreshToken);
    if (refreshed) {
      accessToken = refreshed.accessToken;

      // Rewrite the incoming Cookie header too, not just the outgoing
      // response. Otherwise only *future* requests see the refreshed token —
      // this exact request (e.g. a Server Action that's about to run) would
      // still read the old, now-expired access token via cookies() and get
      // rejected by the backend, even though we just refreshed it.
      const cookieMap = new Map(req.cookies.getAll().map((c) => [c.name, c.value]));
      cookieMap.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken);
      cookieMap.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set(
        "cookie",
        Array.from(cookieMap, ([name, value]) => `${name}=${value}`).join("; "),
      );

      response = NextResponse.next({ request: { headers: requestHeaders } });
      response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, {
        ...cookieOptions,
        maxAge: accessTokenMaxAge(refreshed.accessToken),
      });
      response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, {
        ...cookieOptions,
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_SECONDS,
      });
    }
  }

  const authenticated = !!accessToken && !isAccessTokenExpired(accessToken);

  if (!isPublicPath && !authenticated) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const redirect = NextResponse.redirect(loginUrl);
    redirect.cookies.delete(ACCESS_TOKEN_COOKIE);
    redirect.cookies.delete(REFRESH_TOKEN_COOKIE);
    return redirect;
  }

  if (isPublicPath && authenticated) {
    const dashboardUrl = req.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response ?? NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
