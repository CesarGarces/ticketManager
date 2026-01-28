import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

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
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isOrganizerRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isBuyerRoute = request.nextUrl.pathname.startsWith('/buyer');
  const isLoginRoute = request.nextUrl.pathname === '/login';
  const isOrganizerLoginRoute = request.nextUrl.pathname === '/organizer/login';

  // Protect organizer dashboard
  if (isOrganizerRoute && !user) {
    return NextResponse.redirect(new URL('/organizer/login', request.url));
  }

  // Protect buyer dashboard
  if (isBuyerRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect if already logged in
  if (user) {
    if (isLoginRoute) {
      return NextResponse.redirect(new URL('/events', request.url));
    }
    if (isOrganizerLoginRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/buyer/:path*', '/login', '/organizer/login'],
};
