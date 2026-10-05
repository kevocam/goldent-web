import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SESSION_COOKIE } from '@/lib/supabase/middleware';
import { APP_HOME } from '@/lib/constants';

/** Enlace del correo de recuperación: canjea el código por una sesión. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? APP_HOME;
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : APP_HOME;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const res = NextResponse.redirect(`${origin}${safeNext}`);
      res.cookies.set(SESSION_COOKIE, '1', { httpOnly: true, sameSite: 'lax', path: '/' });
      return res;
    }
  }
  return NextResponse.redirect(`${origin}/login?error=enlace-invalido`);
}
