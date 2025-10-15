import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userRole = null
  if (user) {
    // Create a service role client that bypasses RLS
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          },
        },
      },
    )

    const { data: profile } = await supabaseAdmin.from("profiles").select("role").eq("id", user.id).single()

    userRole = profile?.role
  }

  // Redirect logic based on authentication and role
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")
  const isEmployeePage = request.nextUrl.pathname.startsWith("/employee")
  const isHRPage = request.nextUrl.pathname.startsWith("/hr")

  if (!user && !isAuthPage && request.nextUrl.pathname !== "/") {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage && request.nextUrl.pathname !== "/auth/verify-email") {
    const url = request.nextUrl.clone()
    if (userRole === "hr_admin") {
      url.pathname = "/hr"
    } else {
      url.pathname = "/employee"
    }
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (user && isHRPage && userRole !== "hr_admin") {
    const url = request.nextUrl.clone()
    url.pathname = "/employee"
    return NextResponse.redirect(url)
  }

  if (user && isEmployeePage && userRole === "hr_admin") {
    const url = request.nextUrl.clone()
    url.pathname = "/hr"
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
