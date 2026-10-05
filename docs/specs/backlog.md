# Backlog · MVP

Orden de implementación por valor. Estimación en horas de desarrollo.

## Sprint 0 · Base ✅
- [x] Requerimientos y alcance
- [x] Diseño (17 pantallas)
- [x] Migración 0001 · esquema en Supabase
- [ ] Migración 0002 · alinear con el diseño (`supabase/migrations/0002_align_with_design.sql`)
- [ ] Alta de clínica y usuaria (sección 13 de 0001)

> Detalle de componentes y páginas por tarea: [03 · Arquitectura frontend](03-frontend-architecture.md#10-orden-de-implementación)

## Sprint 1 · Esqueleto (≈ 8 h)
- [ ] S1.1 Next.js + TypeScript + Tailwind con tokens de [02](02-design-system.md), Manrope
- [ ] S1.2 Cliente Supabase (`@supabase/ssr`), variables de entorno, tipos con `supabase gen types`
- [ ] S1.3 Middleware de rutas protegidas
- [ ] S1.4 Shell: barra lateral tablet / barra inferior móvil, indicador de conexión ([F07](features/F07-estados-shell.md))
- [ ] S1.5 Componentes base: Button, Input, Chip, Toggle, AlertPill, StatusPill, Card, Avatar, Toast, EmptyState
- [ ] S1.6 Deploy en Vercel (URL de testing desde el día 1)

## Sprint 2 · Encontrar pacientes (≈ 10 h)
- [ ] S2.1 Login + recuperar contraseña ([F01](features/F01-login.md))
- [ ] S2.2 Inicio: buscador, recientes, sin resultados ([F02](features/F02-inicio-buscador.md))
- [ ] S2.3 Ficha: encabezado + alertas + pestañas Resumen y Datos ([F03](features/F03-ficha-paciente.md))

## Sprint 3 · Registrar (≈ 14 h)
- [ ] S3.1 Nuevo / editar paciente con antecedentes ([F04](features/F04-nuevo-paciente.md))
- [ ] S3.2 Utilidad de fotos: cámara, compresión WebP, subida a Storage, signed URLs
- [ ] S3.3 Captura rápida ([F05](features/F05-captura-rapida.md))
- [ ] S3.4 Ficha: pestaña Archivos con visor

## Sprint 4 · Atender (≈ 12 h)
- [ ] S4.1 Nueva visita con selector FDI ([F06](features/F06-nueva-visita.md))
- [ ] S4.2 Ficha: pestaña Visitas con filtros y cambio de estado
- [ ] S4.3 Ficha: pestaña Antecedentes con edición
- [ ] S4.4 Estados vacíos, carga y error en todas las pantallas

## Sprint 5 · Prueba con la doctora (≈ 6 h)
- [ ] S5.1 QA en iPad Safari y Chrome Android
- [ ] S5.2 Pasar Supabase a Pro (backups) antes de datos reales
- [ ] S5.3 Sesión con la doctora: cargar 20 pacientes reales
- [ ] S5.4 Ajustes por feedback

**Total MVP ≈ 50 h**

## Fase 2 · Agenda (≈ 16 h)
- [ ] Agenda semanal y diaria, CRUD de citas ([F08](features/F08-agenda.md))
- [ ] Recordatorio por WhatsApp
- [ ] "Citas de hoy" y "Próxima cita" reales en Inicio y Ficha

## Después
- Cola offline real (si la conexión del consultorio lo exige)
- Recorte automático de fotos del formato
- Landing + dominio + Google Business Profile
- Cobros, odontograma, firma digital
