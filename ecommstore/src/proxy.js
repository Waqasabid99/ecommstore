import { NextResponse } from "next/server";

export function proxy(request) {
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  console.log("Access Token:", accessToken, "Refresh Token: ", refreshToken )

  if (!accessToken && !refreshToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/user", "/user/:path*"],
};
