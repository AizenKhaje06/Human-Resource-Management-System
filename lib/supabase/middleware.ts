import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // This will refresh session if expired - required for Server Components
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

  return supabaseResponse;
}
