import 'server-only';
import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';

export interface StaffSession {
  userId: string;
  clinicId: string;
  staffName: string;
}

/** Usuario logueado con fila activa en staff. null = sin sesión o sin acceso. */
export const getStaffSession = cache(async (): Promise<StaffSession | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staff } = await supabase
    .from('staff')
    .select('clinic_id, full_name, active')
    .eq('id', user.id)
    .maybeSingle();

  if (!staff || !staff.active) return null;
  return { userId: user.id, clinicId: staff.clinic_id, staffName: staff.full_name };
});
