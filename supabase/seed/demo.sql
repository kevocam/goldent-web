-- =====================================================================
-- GOLDENT · Datos de DEMO para mostrar el sistema
-- Supabase > SQL Editor > New query > pegar todo > Run
--
-- · Crea 8 pacientes ficticios con antecedentes, visitas, tratamientos y citas.
-- · Las fechas son RELATIVAS a hoy (hora de Lima): la agenda de hoy y de esta
--   semana siempre tiene citas, se corra cuando se corra.
-- · Se puede correr varias veces: primero borra la demo anterior (solo filas
--   marcadas con "[DEMO]" en patients.notes). No toca pacientes reales.
-- · Requiere haber corrido las migraciones y el alta de la clínica (paso 13).
-- · Para quitar la demo: correr solo la sección 1 (LIMPIEZA).
-- =====================================================================

create or replace function pg_temp.demo_svc(n text) returns uuid
language sql stable as $$
  select id from public.services where name = n and clinic_id is null limit 1
$$;

create or replace function pg_temp.demo_cond(c text) returns uuid
language sql stable as $$
  select id from public.conditions where code = c and clinic_id is null limit 1
$$;

-- Hora de Lima → timestamptz. d = días desde hoy, t = 'HH:MI'
create or replace function pg_temp.demo_at(d int, t text) returns timestamptz
language sql stable as $$
  select (((now() at time zone 'America/Lima')::date + d) + t::time) at time zone 'America/Lima'
$$;

do $$
declare
  clinic uuid := (select id from public.clinics order by created_at limit 1);
  today  date := (now() at time zone 'America/Lima')::date;
  p_rosa uuid; p_luis uuid; p_maria uuid; p_jorge uuid;
  p_carmen uuid; p_diego uuid; p_lucia uuid; p_julio uuid;
  v uuid; a uuid;
begin
  if clinic is null then
    raise exception 'No hay clínica. Corre primero el alta de la clínica (paso 13 de la migración 0001).';
  end if;

  -- -------------------------------------------------------------------
  -- 1. LIMPIEZA de la demo anterior (orden por llaves foráneas)
  -- -------------------------------------------------------------------
  create temp table demo_ids on commit drop as
    select id from public.patients where clinic_id = clinic and notes like '[DEMO]%';
  delete from public.files              where patient_id in (select id from demo_ids);
  delete from public.treatments         where patient_id in (select id from demo_ids);
  delete from public.visits             where patient_id in (select id from demo_ids);
  delete from public.appointments       where patient_id in (select id from demo_ids);
  delete from public.patient_conditions where patient_id in (select id from demo_ids);
  delete from public.consents           where patient_id in (select id from demo_ids);
  alter table public.patients disable trigger patient_immutable;
  delete from public.patients           where id in (select id from demo_ids);
  alter table public.patients enable trigger patient_immutable;

  -- -------------------------------------------------------------------
  -- 2. PACIENTES (record_number lo pone el trigger: HC-000xx)
  -- -------------------------------------------------------------------
  insert into public.patients (clinic_id, legacy_record_number, first_names, last_names, dni, birth_date, sex, phone, email, address, occupation, marital_status, notes)
  values (clinic, '0152', 'Rosa Elvira', 'Quispe Mamani', '41827365', '1979-03-14', 'F', '951284736', 'rosa.quispe79@gmail.com', 'Jr. Moquegua 345, Puno', 'Comerciante', 'casado', '[DEMO] Paciente frecuente, historia digitalizada desde papel')
  returning id into p_rosa;

  insert into public.patients (clinic_id, first_names, last_names, dni, birth_date, sex, phone, address, occupation, marital_status, notes)
  values (clinic, 'Luis Alberto', 'Huamán Ccama', '72451983', '1992-01-20', 'M', '987105342', 'Av. El Sol 1120, Puno', 'Docente', 'soltero', '[DEMO]')
  returning id into p_luis;

  insert into public.patients (clinic_id, first_names, last_names, dni, birth_date, sex, phone, address, occupation, marital_status, notes)
  values (clinic, 'María Fernanda', 'Torres Salazar', '70318426', '1997-06-02', 'F', '964773019', 'Jr. Arequipa 512, Puno', 'Contadora', 'conviviente', '[DEMO]')
  returning id into p_maria;

  insert into public.patients (clinic_id, first_names, last_names, dni, birth_date, sex, phone, address, occupation, marital_status, notes)
  values (clinic, 'Jorge Luis', 'Mendoza Apaza', '29561840', '1965-08-11', 'M', '958402117', 'Jr. Deustua 230, Puno', 'Transportista', 'casado', '[DEMO]')
  returning id into p_jorge;

  insert into public.patients (clinic_id, legacy_record_number, first_names, last_names, dni, birth_date, sex, phone, address, occupation, marital_status, notes)
  values (clinic, '0187', 'Carmen Rosa', 'Condori Flores', '40976215', '1974-02-27', 'F', '973618254', 'Barrio Bellavista, Puno', 'Ama de casa', 'viudo', '[DEMO]')
  returning id into p_carmen;

  insert into public.patients (clinic_id, first_names, last_names, dni, birth_date, sex, phone, address, occupation, marital_status, notes)
  values (clinic, 'Diego Armando', 'Paredes Vilca', '76840193', '2009-05-30', 'M', '912547806', 'Urb. Chanu Chanu, Puno', 'Estudiante', 'soltero', '[DEMO] Ortodoncia en curso')
  returning id into p_diego;

  insert into public.patients (clinic_id, first_names, last_names, dni, birth_date, sex, phone, address, occupation, marital_status, notes)
  values (clinic, 'Lucía', 'Gutiérrez Chambi', '45128376', '1988-09-09', 'F', '945330671', 'Jr. Lampa 410, Puno', 'Enfermera', 'casado', '[DEMO]')
  returning id into p_lucia;

  -- Como si entrara por Captura rápida: datos mínimos + N.º del papel.
  insert into public.patients (clinic_id, legacy_record_number, first_names, last_names, dni, phone, notes)
  values (clinic, '0203', 'Julio César', 'Mamani Ccahua', '42961578', '974315802', '[DEMO] Digitalizado con Captura rápida')
  returning id into p_julio;

  -- -------------------------------------------------------------------
  -- 3. ANTECEDENTES (las activas con is_alert salen como alertas rojas)
  -- -------------------------------------------------------------------
  insert into public.patient_conditions (clinic_id, patient_id, condition_id, detail, active) values
    (clinic, p_rosa,  pg_temp.demo_cond('allergy'),        'Penicilina',                     true),
    (clinic, p_rosa,  pg_temp.demo_cond('diabetes'),       'Tipo 2, metformina 850 mg',      true),
    (clinic, p_rosa,  pg_temp.demo_cond('blood_pressure'), 'Presión alta, controlada',       true),
    (clinic, p_rosa,  pg_temp.demo_cond('medication'),     'Metformina 850 mg, losartán 50 mg', true),
    (clinic, p_maria, pg_temp.demo_cond('pregnant'),       '20 semanas',                     true),
    (clinic, p_maria, pg_temp.demo_cond('medication'),     'Ácido fólico, sulfato ferroso',  true),
    (clinic, p_jorge, pg_temp.demo_cond('heart_disease'),  'Arritmia, controlada',           true),
    (clinic, p_jorge, pg_temp.demo_cond('medication'),     'Warfarina (anticoagulante)',     true),
    (clinic, p_jorge, pg_temp.demo_cond('bleeding'),       'Sangrado prolongado tras extracción', true),
    (clinic, p_lucia, pg_temp.demo_cond('allergy'),        'Látex',                          true);

  -- -------------------------------------------------------------------
  -- 4. VISITAS Y TRATAMIENTOS (pasado)
  -- -------------------------------------------------------------------
  -- Rosa: 3 visitas → timeline, pendientes y una endodoncia en proceso.
  insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
  values (clinic, p_rosa, today - 75, 'Caries en premolares', 'Pieza 15 queda pendiente por tiempo. Sensibilidad al frío.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_rosa, v, pg_temp.demo_svc('Resina simple'),    '24', 'done'),
    (clinic, p_rosa, v, pg_temp.demo_svc('Resina compuesta'), '15', 'planned');

  insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
  values (clinic, p_rosa, today - 21, 'Control y limpieza', 'Sangrado leve al sondaje en sector anteroinferior. Se refuerza técnica de cepillado.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_rosa, v, pg_temp.demo_svc('Profilaxis'),  null, 'done'),
    (clinic, p_rosa, v, pg_temp.demo_svc('Destartraje'), null, 'done');

  insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
  values (clinic, p_rosa, today - 7, 'Dolor en molar inferior derecho', 'Apertura cameral y conductometría. Medicación intraconducto con hidróxido de calcio. Refiere dolor a la percusión.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_rosa, v, pg_temp.demo_svc('Endodoncia multirradicular'), '46', 'in_progress'),
    (clinic, p_rosa, v, pg_temp.demo_svc('Rayos X'),                    '46', 'done'),
    (clinic, p_rosa, v, pg_temp.demo_svc('Perno'),                      '46', 'planned');

  -- Luis: una resina planificada (se atiende hoy).
  insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
  values (clinic, p_luis, today - 30, 'Revisión general', 'Caries oclusal en pieza 36. Se programa resina.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_luis, v, pg_temp.demo_svc('Profilaxis'),       null, 'done'),
    (clinic, p_luis, v, pg_temp.demo_svc('Resina compuesta'), '36', 'planned');

  -- María: control en el embarazo.
  insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
  values (clinic, p_maria, today - 40, 'Control', 'Gestante, 14 semanas. Solo profilaxis; tratamientos electivos después del parto.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_maria, v, pg_temp.demo_svc('Profilaxis'), null, 'done');

  -- Jorge: prótesis en proceso (anticoagulado: ojo con extracciones).
  insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
  values (clinic, p_jorge, today - 60, 'Pérdida de piezas posteriores', 'Toma warfarina: coordinar con cardiología antes de cualquier cirugía.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_jorge, v, pg_temp.demo_svc('Rayos X'),                    null, 'done'),
    (clinic, p_jorge, v, pg_temp.demo_svc('Prótesis parcial removible'), null, 'in_progress');

  -- Carmen: limpieza antigua.
  insert into public.visits (clinic_id, patient_id, visit_date, reason)
  values (clinic, p_carmen, today - 180, 'Limpieza')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_carmen, v, pg_temp.demo_svc('Profilaxis'),  null, 'done'),
    (clinic, p_carmen, v, pg_temp.demo_svc('Destartraje'), null, 'done');

  -- Diego: ortodoncia con controles mensuales.
  insert into public.visits (clinic_id, patient_id, visit_date, reason, notes)
  values (clinic, p_diego, today - 95, 'Inicio de ortodoncia', 'Colocación de brackets superiores e inferiores.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_diego, v, pg_temp.demo_svc('Ortodoncia inicial'), null, 'done');
  insert into public.visits (clinic_id, patient_id, visit_date, reason)
  values (clinic, p_diego, today - 63, 'Control de ortodoncia') returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_diego, v, pg_temp.demo_svc('Ortodoncia mensualidad'), null, 'done');
  insert into public.visits (clinic_id, patient_id, visit_date, reason)
  values (clinic, p_diego, today - 32, 'Control de ortodoncia') returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_diego, v, pg_temp.demo_svc('Ortodoncia mensualidad'), null, 'done');

  -- Lucía: resina hecha.
  insert into public.visits (clinic_id, patient_id, visit_date, reason)
  values (clinic, p_lucia, today - 14, 'Sensibilidad en incisivo') returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_lucia, v, pg_temp.demo_svc('Resina simple'), '21', 'done');

  -- Julio: sin visitas (muestra el estado vacío de la ficha).

  -- -------------------------------------------------------------------
  -- 5. AGENDA: hoy y los próximos días (todos los estados)
  -- -------------------------------------------------------------------
  -- Hoy 09:00 Carmen → ATENDIDA: se registra la visita con appointment_id
  -- (el trigger visit_closes_appointment la pasa a "done", como "Atender").
  insert into public.appointments (clinic_id, patient_id, starts_at, ends_at, status, reason)
  values (clinic, p_carmen, pg_temp.demo_at(0, '09:00'), pg_temp.demo_at(0, '09:45'), 'confirmed', 'Profilaxis')
  returning id into a;
  insert into public.visits (clinic_id, patient_id, appointment_id, visit_date, reason, notes)
  values (clinic, p_carmen, a, today, 'Profilaxis', 'Atendida desde la agenda.')
  returning id into v;
  insert into public.treatments (clinic_id, patient_id, visit_id, service_id, tooth, status) values
    (clinic, p_carmen, v, pg_temp.demo_svc('Profilaxis'), null, 'done');

  insert into public.appointments (clinic_id, patient_id, starts_at, ends_at, status, reason) values
    -- hoy
    (clinic, p_diego, pg_temp.demo_at(0, '10:00'), pg_temp.demo_at(0, '10:45'), 'no_show',   'Ortodoncia · mensualidad'),
    (clinic, p_luis,  pg_temp.demo_at(0, '11:30'), pg_temp.demo_at(0, '12:30'), 'confirmed', 'Resina compuesta · pieza 36'),
    (clinic, p_maria, pg_temp.demo_at(0, '16:00'), pg_temp.demo_at(0, '16:45'), 'scheduled', 'Control'),
    -- próximos días
    (clinic, p_jorge, pg_temp.demo_at(1, '09:30'), pg_temp.demo_at(1, '11:00'), 'scheduled', 'Prótesis parcial removible'),
    (clinic, p_lucia, pg_temp.demo_at(1, '15:00'), pg_temp.demo_at(1, '16:00'), 'confirmed', 'Destartraje'),
    (clinic, p_julio, pg_temp.demo_at(2, '10:00'), pg_temp.demo_at(2, '10:30'), 'scheduled', 'Evaluación'),
    (clinic, p_carmen,pg_temp.demo_at(2, '17:00'), pg_temp.demo_at(2, '17:45'), 'cancelled', 'Control'),
    (clinic, p_rosa,  pg_temp.demo_at(3, '10:30'), pg_temp.demo_at(3, '12:00'), 'confirmed', 'Continuación de endodoncia'),
    (clinic, p_diego, pg_temp.demo_at(3, '16:00'), pg_temp.demo_at(3, '16:45'), 'scheduled', 'Ortodoncia · mensualidad'),
    (clinic, p_luis,  pg_temp.demo_at(4, '09:00'), pg_temp.demo_at(4, '10:00'), 'scheduled', 'Control'),
    (clinic, p_maria, pg_temp.demo_at(4, '12:00'), pg_temp.demo_at(4, '13:00'), 'scheduled', 'Profilaxis'),
    -- pasado reciente (para que la semana anterior no quede vacía)
    (clinic, p_lucia, pg_temp.demo_at(-2, '15:00'), pg_temp.demo_at(-2, '15:45'), 'done',    'Control');

  raise notice 'Demo lista: 8 pacientes, % visitas, % citas.',
    (select count(*) from public.visits where patient_id in (p_rosa,p_luis,p_maria,p_jorge,p_carmen,p_diego,p_lucia,p_julio)),
    (select count(*) from public.appointments where patient_id in (p_rosa,p_luis,p_maria,p_jorge,p_carmen,p_diego,p_lucia,p_julio));
end $$;
