-- =====================================================================
-- GOLDENT · Consultorio Odontológico
-- Esquema MVP v1 — Supabase (Postgres 15+)
-- Ejecutar completo en: Supabase > SQL Editor > New query > Run
-- =====================================================================
-- Decisiones:
--  · 1 clínica en el MVP; clinic_id en todo para crecer sin migrar.
--  · Edad NO se guarda: se calcula desde birth_date.
--  · Nada clínico se borra: no hay política DELETE; se usa deleted_at.
--  · record_number automático (HC-0001); legacy_record_number = H.Cl. del papel.
--  · Cita (agendada) ≠ Visita (atención real). visits.appointment_id opcional.
--  · Sin cobros, sin odontograma, sin OCR en este entregable.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0. EXTENSIONES
-- ---------------------------------------------------------------------
create extension if not exists pg_trgm  with schema extensions;
create extension if not exists unaccent with schema extensions;

-- unaccent no es IMMUTABLE; este wrapper permite usarlo en índices.
create or replace function public.f_unaccent(text)
returns text
language sql immutable parallel safe strict
set search_path = ''
as $$ select extensions.unaccent('extensions.unaccent'::regdictionary, $1) $$;


-- ---------------------------------------------------------------------
-- 1. CLÍNICA Y PERSONAL
-- ---------------------------------------------------------------------
create table public.clinics (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  ruc           text unique,
  phone         text,
  address       text,
  logo_path     text,
  record_seq    integer not null default 0,   -- contador para HC-0001…
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.staff (
  id            uuid primary key references auth.users(id) on delete cascade,
  clinic_id     uuid not null references public.clinics(id),
  full_name     text not null,
  role          text not null default 'dentist'
                check (role in ('owner','dentist','assistant')),
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Clínica del usuario logueado. Base de todas las políticas RLS.
create or replace function public.current_clinic_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select clinic_id from public.staff
  where id = auth.uid() and active
  limit 1
$$;


-- ---------------------------------------------------------------------
-- 2. PACIENTES
-- ---------------------------------------------------------------------
create table public.patients (
  id                    uuid primary key default gen_random_uuid(),
  clinic_id             uuid not null default public.current_clinic_id()
                        references public.clinics(id),
  record_number         text not null,          -- HC-0001 (lo pone el trigger)
  legacy_record_number  text,                   -- H.Cl. escrito en el papel
  first_names           text not null,
  last_names            text not null,
  dni                   text check (dni ~ '^[0-9]{8}$'),
  birth_date            date check (birth_date <= current_date),
  sex                   text check (sex in ('F','M')),
  phone                 text,
  email                 text,
  address               text,
  occupation            text,
  marital_status        text check (marital_status in
                        ('soltero','casado','conviviente','divorciado','viudo')),
  notes                 text,
  deleted_at            timestamptz,
  created_by            uuid default auth.uid() references auth.users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  unique (clinic_id, id),                       -- para FKs compuestas
  unique (clinic_id, record_number)
);

create unique index patients_dni_uq
  on public.patients (clinic_id, dni) where dni is not null and deleted_at is null;
create index patients_legacy_idx
  on public.patients (clinic_id, legacy_record_number) where legacy_record_number is not null;
create index patients_phone_idx
  on public.patients (clinic_id, phone) where deleted_at is null;
create index patients_name_trgm_idx
  on public.patients using gin
  (public.f_unaccent(lower(first_names || ' ' || last_names)) extensions.gin_trgm_ops)
  where deleted_at is null;


-- ---------------------------------------------------------------------
-- 3. ANTECEDENTES ("Ud. sufre de")
-- ---------------------------------------------------------------------
create table public.conditions (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid references public.clinics(id),  -- null = catálogo global
  code          text not null,
  label         text not null,
  needs_detail  boolean not null default false,       -- pide campo "¿cuál?"
  is_alert      boolean not null default true,        -- sale como badge en la ficha
  sort_order    integer not null default 0,
  active        boolean not null default true
);
create unique index conditions_code_uq
  on public.conditions (coalesce(clinic_id, '00000000-0000-0000-0000-000000000000'::uuid), code);

create table public.patient_conditions (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  condition_id  uuid not null references public.conditions(id),
  detail        text,                                  -- ej. "penicilina"
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id),
  unique (patient_id, condition_id)
);


-- ---------------------------------------------------------------------
-- 4. CATÁLOGO DE SERVICIOS
-- ---------------------------------------------------------------------
create table public.services (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid references public.clinics(id),  -- null = catálogo global
  name          text not null,
  category      text not null,
  requires_tooth boolean not null default false,     -- la UI pide pieza dental
  default_price numeric(10,2),                       -- reservado (fase cobros)
  sort_order    integer not null default 0,
  active        boolean not null default true
);
create unique index services_name_uq
  on public.services (coalesce(clinic_id, '00000000-0000-0000-0000-000000000000'::uuid), name);


-- ---------------------------------------------------------------------
-- 5. CITAS (lo agendado)
-- ---------------------------------------------------------------------
create table public.appointments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  status        text not null default 'scheduled'
                check (status in ('scheduled','confirmed','done','cancelled','no_show')),
  reason        text,
  notes         text,
  deleted_at    timestamptz,
  created_by    uuid default auth.uid() references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id)
);
create index appointments_day_idx
  on public.appointments (clinic_id, starts_at) where deleted_at is null;
create index appointments_patient_idx on public.appointments (patient_id);


-- ---------------------------------------------------------------------
-- 6. VISITAS (lo que realmente pasó) y TRATAMIENTOS
-- ---------------------------------------------------------------------
create table public.visits (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null default public.current_clinic_id(),
  patient_id      uuid not null,
  appointment_id  uuid unique,                -- null = llegó sin cita
  visit_date      date not null default current_date,
  reason          text,                       -- "¿Motivo de su visita?"
  notes           text,
  deleted_at      timestamptz,
  created_by      uuid default auth.uid() references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id)     references public.patients (clinic_id, id),
  foreign key (clinic_id, appointment_id) references public.appointments (clinic_id, id)
);
create index visits_patient_idx
  on public.visits (patient_id, visit_date desc) where deleted_at is null;

create table public.treatments (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  visit_id      uuid not null,
  service_id    uuid not null references public.services(id),
  tooth         text check (tooth ~ '^([1-4][1-8]|[5-8][1-5])$'),  -- FDI
  status        text not null default 'done'
                check (status in ('planned','in_progress','done')),
  notes         text,
  deleted_at    timestamptz,
  created_by    uuid default auth.uid() references auth.users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id),
  foreign key (clinic_id, visit_id)   references public.visits   (clinic_id, id)
);
create index treatments_visit_idx   on public.treatments (visit_id) where deleted_at is null;
create index treatments_patient_idx on public.treatments (patient_id) where deleted_at is null;


-- ---------------------------------------------------------------------
-- 7. ARCHIVOS (fotos, rayos X, papel escaneado) y CONSENTIMIENTO
-- ---------------------------------------------------------------------
create table public.files (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  visit_id      uuid,
  treatment_id  uuid,
  kind          text not null
                check (kind in ('paper_record','xray','photo','consent','other')),
  storage_path  text not null unique,   -- {clinic_id}/{patient_id}/{file_id}.webp
  mime_type     text,
  size_bytes    bigint,
  page_number   integer,                -- historia en papel con varias hojas
  caption       text,
  taken_at      date,
  deleted_at    timestamptz,
  created_by    uuid default auth.uid() references auth.users(id),
  created_at    timestamptz not null default now(),
  unique (clinic_id, id),
  foreign key (clinic_id, patient_id)   references public.patients   (clinic_id, id),
  foreign key (clinic_id, visit_id)     references public.visits     (clinic_id, id),
  foreign key (clinic_id, treatment_id) references public.treatments (clinic_id, id)
);
create index files_patient_idx
  on public.files (patient_id, kind) where deleted_at is null;

create table public.consents (
  id            uuid primary key default gen_random_uuid(),
  clinic_id     uuid not null default public.current_clinic_id(),
  patient_id    uuid not null,
  signed_at     date not null default current_date,
  method        text not null default 'paper' check (method in ('paper','digital')),
  file_id       uuid,                   -- foto del consentimiento firmado
  created_by    uuid default auth.uid() references auth.users(id),
  created_at    timestamptz not null default now(),
  foreign key (clinic_id, patient_id) references public.patients (clinic_id, id),
  foreign key (clinic_id, file_id)    references public.files    (clinic_id, id)
);
create index consents_patient_idx on public.consents (patient_id, signed_at desc);


-- ---------------------------------------------------------------------
-- 8. AUDITORÍA
-- ---------------------------------------------------------------------
create table public.audit_log (
  id          bigint generated always as identity primary key,
  clinic_id   uuid,
  table_name  text not null,
  record_id   uuid not null,
  action      text not null check (action in ('INSERT','UPDATE','DELETE')),
  old_data    jsonb,
  new_data    jsonb,
  changed_by  uuid,
  changed_at  timestamptz not null default now()
);
create index audit_record_idx on public.audit_log (table_name, record_id, changed_at desc);


-- ---------------------------------------------------------------------
-- 9. FUNCIONES Y TRIGGERS
-- ---------------------------------------------------------------------

-- updated_at automático
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array['clinics','staff','patients','patient_conditions',
                           'appointments','visits','treatments']
  loop
    execute format('create trigger set_updated_at before update on public.%I
                    for each row execute function public.tg_set_updated_at()', t);
  end loop;
end $$;

-- HC-0001 automático, correlativo por clínica (sin huecos por concurrencia)
create or replace function public.tg_patient_record_number()
returns trigger language plpgsql security definer set search_path = '' as $$
declare seq integer;
begin
  update public.clinics set record_seq = record_seq + 1
   where id = new.clinic_id
   returning record_seq into seq;
  new.record_number := 'HC-' || lpad(seq::text, 4, '0');
  return new;
end $$;

create trigger patient_record_number before insert on public.patients
for each row execute function public.tg_patient_record_number();

-- No se puede cambiar el número de historia ni mover un paciente de clínica
create or replace function public.tg_patient_immutable()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.record_number <> old.record_number or new.clinic_id <> old.clinic_id then
    raise exception 'record_number y clinic_id no se pueden modificar';
  end if;
  return new;
end $$;

create trigger patient_immutable before update on public.patients
for each row execute function public.tg_patient_immutable();

-- Al registrar una visita desde una cita, la cita pasa a "done"
create or replace function public.tg_visit_closes_appointment()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.appointment_id is not null then
    update public.appointments set status = 'done'
     where id = new.appointment_id and status <> 'done';
  end if;
  return new;
end $$;

create trigger visit_closes_appointment after insert on public.visits
for each row execute function public.tg_visit_closes_appointment();

-- Auditoría de tablas clínicas
create or replace function public.tg_audit()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_log (clinic_id, table_name, record_id, action,
                                old_data, new_data, changed_by)
  values ((rec->>'clinic_id')::uuid, tg_table_name, (rec->>'id')::uuid, tg_op,
          case when tg_op <> 'INSERT' then to_jsonb(old) end,
          case when tg_op <> 'DELETE' then to_jsonb(new) end,
          auth.uid());
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['patients','patient_conditions','appointments',
                           'visits','treatments','files','consents']
  loop
    execute format('create trigger audit after insert or update or delete on public.%I
                    for each row execute function public.tg_audit()', t);
  end loop;
end $$;

-- Buscador: nombre (tolera tildes/typos), DNI, celular, HC o H.Cl. antiguo
-- Uso desde el front: supabase.rpc('search_patients', { q: 'gonsales' })
create or replace function public.search_patients(q text, max_results int default 20)
returns setof public.patients
language sql stable security invoker
set search_path = ''
as $$
  with term as (
    select public.f_unaccent(lower(trim(q))) as t,
           regexp_replace(q, '\D', '', 'g')  as digits
  )
  select p.*
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


-- ---------------------------------------------------------------------
-- 10. ROW LEVEL SECURITY
--     Solo personal activo de la clínica ve/edita sus datos.
--     Sin políticas DELETE en tablas clínicas = borrado físico bloqueado.
-- ---------------------------------------------------------------------
alter table public.clinics            enable row level security;
alter table public.staff              enable row level security;
alter table public.patients           enable row level security;
alter table public.conditions         enable row level security;
alter table public.patient_conditions enable row level security;
alter table public.services           enable row level security;
alter table public.appointments       enable row level security;
alter table public.visits             enable row level security;
alter table public.treatments         enable row level security;
alter table public.files              enable row level security;
alter table public.consents           enable row level security;
alter table public.audit_log          enable row level security;

create policy clinics_select on public.clinics for select to authenticated
  using (id = (select public.current_clinic_id()));
create policy clinics_update on public.clinics for update to authenticated
  using (id = (select public.current_clinic_id()));

create policy staff_select on public.staff for select to authenticated
  using (clinic_id = (select public.current_clinic_id()));

create policy catalog_conditions on public.conditions for select to authenticated
  using (clinic_id is null or clinic_id = (select public.current_clinic_id()));
create policy catalog_services on public.services for select to authenticated
  using (clinic_id is null or clinic_id = (select public.current_clinic_id()));

do $$
declare t text;
begin
  foreach t in array array['patients','patient_conditions','appointments',
                           'visits','treatments','files','consents']
  loop
    execute format('create policy %1$s_select on public.%1$I for select to authenticated
                    using (clinic_id = (select public.current_clinic_id()))', t);
    execute format('create policy %1$s_insert on public.%1$I for insert to authenticated
                    with check (clinic_id = (select public.current_clinic_id()))', t);
    execute format('create policy %1$s_update on public.%1$I for update to authenticated
                    using (clinic_id = (select public.current_clinic_id()))
                    with check (clinic_id = (select public.current_clinic_id()))', t);
  end loop;
end $$;

create policy audit_select on public.audit_log for select to authenticated
  using (clinic_id = (select public.current_clinic_id()));


-- ---------------------------------------------------------------------
-- 11. STORAGE: bucket privado + acceso solo a la carpeta de tu clínica
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('patient-files', 'patient-files', false, 5242880,
        array['image/webp','image/jpeg','image/png','application/pdf'])
on conflict (id) do nothing;

create policy patient_files_select on storage.objects for select to authenticated
  using (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select public.current_clinic_id())::text);
create policy patient_files_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'patient-files'
         and (storage.foldername(name))[1] = (select public.current_clinic_id())::text);


-- ---------------------------------------------------------------------
-- 12. SEED: catálogos tal cual el formato en papel
-- ---------------------------------------------------------------------
insert into public.conditions (code, label, needs_detail, sort_order) values
  ('allergy',        'Alergias',              true,  1),
  ('diabetes',       'Diabetes',              false, 2),
  ('bleeding',       'Hemorragias',           false, 3),
  ('blood_pressure', 'Presión alta / baja',   true,  4),
  ('gastric_ulcer',  'Úlcera gástrica',       false, 5),
  ('heart_disease',  'Enfermedad cardiaca',   true,  6),
  ('medication',     'Recibe medicamento',    true,  7),
  ('other_disease',  'Otra enfermedad',       true,  8),
  ('pregnant',       'Embarazada',            false, 9);

insert into public.services (name, category, requires_tooth, sort_order) values
  ('Resina simple',               'Restauración', true,   1),
  ('Resina compuesta',            'Restauración', true,   2),
  ('Resina compleja',             'Restauración', true,   3),
  ('Endodoncia uni radicular',    'Endodoncia',   true,   4),
  ('Endodoncia multi radicular',  'Endodoncia',   true,   5),
  ('Biopulpotomía',               'Endodoncia',   true,   6),
  ('Perno',                       'Prótesis',     true,   7),
  ('Prótesis fija',               'Prótesis',     false,  8),
  ('Prótesis parcial removible',  'Prótesis',     false,  9),
  ('Prótesis total',              'Prótesis',     false, 10),
  ('Profilaxis',                  'Prevención',   false, 11),
  ('Destartraje',                 'Prevención',   false, 12),
  ('Blanqueamiento dental',       'Estética',     false, 13),
  ('Implantes',                   'Cirugía',      true,  14),
  ('Cirugía bucal',               'Cirugía',      false, 15),
  ('Rayos X',                     'Diagnóstico',  false, 16),
  ('Ortodoncia inicial',          'Ortodoncia',   false, 17),
  ('Ortodoncia mensualidad',      'Ortodoncia',   false, 18),
  ('Otros',                       'Otros',        false, 19);


-- ---------------------------------------------------------------------
-- 13. ALTA DE LA CLÍNICA Y LA DOCTORA (correr DESPUÉS, a mano)
-- ---------------------------------------------------------------------
-- a) Crear el usuario en Authentication > Users > Add user (email + clave).
-- b) Ejecutar, reemplazando el email:
--
-- with c as (
--   insert into public.clinics (name, phone, address)
--   values ('Goldent Consultorio Odontológico', '9XXXXXXXX', 'Dirección')
--   returning id
-- )
-- insert into public.staff (id, clinic_id, full_name, role)
-- select u.id, c.id, 'Dra. Nombre Apellido', 'owner'
-- from auth.users u, c
-- where u.email = 'doctora@email.com';
