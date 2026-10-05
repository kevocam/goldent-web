import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { APP_HOME } from '@/lib/constants';

/** Cookies propias para "Mantener la sesión iniciada en esta tablet" (F01). */
export const SESSION_COOKIE = 'gd_session'; // cookie de sesión: muere al cerrar el navegador
export const REMEMBER_COOKIE = 'gd_remember'; // persistente: 30 días

/** "/" (landing) es pública; el resto del sistema pide sesión. */
const PUBLIC_PATHS = ['/login', '/reset-password', '/auth'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = path === '/' || PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

  const redirectTo = (pathname: string, search = '') => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = search;
    const res = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => res.cookies.set(c));
    return res;
  };

  if (!user && !isPublic) {
    return redirectTo('/login');
  }

  if (user && !isPublic) {
    // Sesión sin "mantener iniciada" y el navegador se cerró: cerrar sesión.
    const keep = request.cookies.has(REMEMBER_COOKIE) || request.cookies.has(SESSION_COOKIE);
    if (!keep) {
      await supabase.auth.signOut();
      return redirectTo('/login');
    }
  }

  if (user && path === '/login') {
    return redirectTo(APP_HOME);
  }

  return response;
}
