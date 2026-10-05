import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Service } from '@/types/domain';

export type ServiceOption = Pick<Service, 'id' | 'name' | 'category' | 'requires_tooth' | 'sort_order'>;

/** Servicios activos para los chips de Nueva visita. */
export async function getServicesCatalog(): Promise<ServiceOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('services')
    .select('id, name, category, requires_tooth, sort_order')
    .eq('active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}
