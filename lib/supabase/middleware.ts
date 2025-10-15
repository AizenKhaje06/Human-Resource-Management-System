import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Role-based redirects (use public data, not service key)
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isEmployeePage = request.nextUrl.pathname.startsWith("/employee");
  const isHRPage = request.nextUrl.pathname.startsWith("/hr");

  if (!user && !isAuthPage && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage && request.nextUrl.pathname !== "/auth/verify-email") {
    const url = request.nextUrl.clone();
    url.pathname = user?.user_metadata?.role === "hr_admin" ? "/hr" : "/employee";
    return NextResponse.redirect(url);
  }

  if (user && isHRPage && user?.user_metadata?.role !== "hr_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/employee";
    return NextResponse.redirect(url);
  }

  if (user && isEmployeePage && user?.user_metadata?.role === "hr_admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/hr";
    return NextResponse.redirect(url);
  }

  return response;
}
