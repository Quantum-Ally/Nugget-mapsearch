import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Ensure proper cookie options for production
          const cookieOptions: CookieOptions = {
            ...options,
            // Set secure flag for HTTPS in production
            secure: process.env.NODE_ENV === 'production',
            // Set SameSite to Lax for better compatibility
            sameSite: (options.sameSite as 'lax' | 'strict' | 'none' | undefined) || 'lax',
            // Ensure path is set
            path: options.path || '/',
          };
          request.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...cookieOptions,
          });
        },
        remove(name: string, options: CookieOptions) {
          const cookieOptions: CookieOptions = {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: (options.sameSite as 'lax' | 'strict' | 'none' | undefined) || 'lax',
            path: options.path || '/',
          };
          request.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...cookieOptions,
          });
        },
      },
    }
  );

  // Wrap getSession in try-catch to prevent middleware from breaking
  try {
    await supabase.auth.getSession();
  } catch (error) {
    // Log error but don't break the request
    console.error('[Middleware] Error getting session:', error);
  }

  // Lightweight auth gate for protected areas (role checks remain client-side/DB-enforced)
  try {
    const url = new URL(request.url);
    const pathname = url.pathname || '';
    const requiresAuth =
      pathname.startsWith('/admin') ||
      pathname.startsWith('/owner');

    if (requiresAuth) {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      const isLoggedIn = !!userData?.user && !userError;

      if (!isLoggedIn) {
        const redirectUrl = new URL('/login', url.origin);
        redirectUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch (gateError) {
    // If gating fails for any reason, do not block the request
    console.error('[Middleware] Auth gate error:', gateError);
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
