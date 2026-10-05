import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { REMEMBER_COOKIE, SESSION_COOKIE } from '@/lib/supabase/middleware';

/** Cierra la sesión de un usuario sin fila activa en `staff` (evita el bucle login ↔ inicio). */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const res = NextResponse.redirect(new URL('/login?error=sin-acceso', request.url));
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(REMEMBER_COOKIE);
  return res;
}
