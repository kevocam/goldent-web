-- =====================================================================
-- GOLDENT · Migración 0002 · Alinear la base con el diseño
-- Ejecutar en: Supabase > SQL Editor (después de 0001)
-- =====================================================================
-- 1. Número de historia con 5 dígitos (el diseño muestra HC 00248).
-- 2. Todos los antecedentes aceptan detalle (el diseño pide detalle en todos).
-- 3. Categorías de servicios = grupos de chips de "Nueva visita".
-- 4. Buscador devuelve alertas y última visita (lista de resultados).
-- 5. Nueva función para "Recientes" en Inicio.
-- =====================================================================


-- 1. HC-00001 ---------------------------------------------------------
create or replace function public.tg_patient_record_number()
returns trigger language plpgsql security definer set search_path = '' as $$
declare seq integer;
begin
  update public.clinics set record_seq = record_seq + 1
   where id = new.clinic_id
   returning record_seq into seq;
  new.record_number := 'HC-' || lpad(seq::text, 5, '0');
  return new;
end $$;

-- Reformatea los que ya existan (HC-0001 → HC-00001). Seguro si la tabla está vacía.
alter table public.patients disable trigger patient_immutable;
update public.patients
   set record_number = 'HC-' || lpad(substring(record_number from 4), 5, '0')
 where record_number ~ '^HC-[0-9]{1,4}$';
alter table public.patients enable trigger patient_immutable;


-- 2. Detalle en todos los antecedentes -------------------------------
update public.conditions set needs_detail = true where clinic_id is null;


-- 3. Categorías de servicios = grupos del diseño ---------------------
update public.services s set category = v.category, sort_order = v.sort_order
from (values
  ('Resina simple',              'Restauraciones',        1),
  ('Resina compuesta',           'Restauraciones',        2),
  ('Resina compleja',            'Restauraciones',        3),
  ('Endodoncia uni radicular',   'Endodoncia',            4),
  ('Endodoncia multi radicular', 'Endodoncia',            5),
  ('Biopulpotomía',              'Endodoncia',            6),
  ('Perno',                      'Prótesis',              7),
  ('Prótesis fija',              'Prótesis',              8),
  ('Prótesis parcial removible', 'Prótesis',              9),
  ('Prótesis total',             'Prótesis',             10),
  ('Profilaxis',                 'Prevención y estética',11),
  ('Destartraje',                'Prevención y estética',12),
  ('Blanqueamiento dental',      'Prevención y estética',13),
  ('Cirugía bucal',              'Cirugía',              14),
  ('Implantes',                  'Cirugía',              15),
  ('Ortodoncia inicial',         'Ortodoncia',           16),
  ('Ortodoncia mensualidad',     'Ortodoncia',           17),
  ('Rayos X',                    'Diagnóstico y otros',  18),
  ('Otros',                      'Diagnóstico y otros',  19)
) as v(name, category, sort_order)
where s.name = v.name and s.clinic_id is null;

update public.services set name = 'Endodoncia unirradicular'
 where name = 'Endodoncia uni radicular' and clinic_id is null;
update public.services set name = 'Endodoncia multirradicular'
 where name = 'Endodoncia multi radicular' and clinic_id is null;


-- 4 y 5. Tarjeta de paciente para listas -----------------------------
-- Lo que muestra cada fila del buscador y de "Recientes":
-- nombre, HC, edad, DNI, celular, alertas activas y fecha de última visita.
create or replace function public.patient_card(p public.patients)
returns jsonb
language sql stable security invoker set search_path = '' as $$
  select jsonb_build_object(
    'id',            p.id,
    'record_number', p.record_number,
    'legacy_record_number', p.legacy_record_number,
    'first_names',   p.first_names,
    'last_names',    p.last_names,
    'dni',           p.dni,
    'phone',         p.phone,
    'age',           extract(year from age(p.birth_date))::int,
    'alerts', coalesce((
       select jsonb_agg(
                case when c.code = 'allergy' and pc.detail is not null
                     then 'Alergia: ' || pc.detail
                     else c.label end
                order by c.sort_order)
       from public.patient_conditions pc
       join public.conditions c on c.id = pc.condition_id
       where pc.patient_id = p.id and pc.active and c.is_alert), '[]'::jsonb),
    'last_visit', (select max(v.visit_date) from public.visits v
                   where v.patient_id = p.id and v.deleted_at is null)
  )
$$;

drop function if exists public.search_patients(text, int);

-- Uso: supabase.rpc('search_patients', { q: 'gonsales' })  →  jsonb[]
create function public.search_patients(q text, max_results int default 20)
returns setof jsonb
language sql stable security invoker
set search_path = ''
as $$
  with term as (
    select public.f_unaccent(lower(trim(q))) as t,
           regexp_replace(q, '\D', '', 'g')  as digits
  )
  select public.patient_card(p)
  from public.patients p, term
  where p.deleted_at is null
    and (
         extensions.word_similarity(          -- 0.4 tolera 1-2 letras mal escritas
           term.t, public.f_unaccent(lower(p.first_names || ' ' || p.last_names))) >= 0.4
      or public.f_unaccent(lower(p.first_names || ' ' || p.last_names))
           like '%' || term.t || '%'
      or (length(term.digits) >= 3 and (p.dni   like term.digits || '%'
                                     or p.phone like '%' || term.digits || '%'))
      or upper(p.record_number)        = upper(trim(q))
      or upper(p.legacy_record_number) = upper(trim(q))
    )
  order by extensions.word_similarity(
             term.t, public.f_unaccent(lower(p.first_names || ' ' || p.last_names))) desc,
           p.last_names
  limit max_results
$$;

-- Uso: supabase.rpc('recent_patients', { max_results: 6 })
-- Ordena por última actividad: visita más reciente o alta/edición del paciente.
create or replace function public.recent_patients(max_results int default 6)
returns setof jsonb
language sql stable security invoker set search_path = '' as $$
  select public.patient_card(p)
  from public.patients p
  left join lateral (
    select max(v.created_at) as last_activity from public.visits v
    where v.patient_id = p.id and v.deleted_at is null
  ) v on true
  where p.deleted_at is null
  order by greatest(p.updated_at, coalesce(v.last_activity, p.updated_at)) desc
  limit max_results
$$;

grant execute on function public.search_patients(text, int) to authenticated;
grant execute on function public.recent_patients(int)       to authenticated;
grant execute on function public.patient_card(public.patients) to authenticated;
