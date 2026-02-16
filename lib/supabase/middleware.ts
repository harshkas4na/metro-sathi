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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log("[MIDDLEWARE]", request.nextUrl.pathname, "| user:", user ? user.id : "NULL");

  // Public routes that don't need auth
  const publicPaths = ["/", "/auth/callback", "/auth/login"];
  const isPublicPath = publicPaths.some(
    (path) => request.nextUrl.pathname === path
  );

  if (!user && !isPublicPath) {
    console.log("[MIDDLEWARE] No user on protected route, redirecting to /");
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // If user is logged in and tries to access landing page, redirect to dashboard
  if (user && request.nextUrl.pathname === "/") {
    console.log("[MIDDLEWARE] User on landing, redirecting to /dashboard");
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  console.log("[MIDDLEWARE] Passing through for", request.nextUrl.pathname);
  return supabaseResponse;
}
