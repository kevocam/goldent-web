# GOLDENT · Historia clínica digital

App web (tablet primero) para el consultorio Goldent. Implementa el MVP de `docs/specs/` (F01–F07).

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 · Supabase (`@supabase/ssr`) · react-hook-form + zod · Vitest.

## Puesta en marcha

```bash
npm install --legacy-peer-deps
cp .env.example .env.local      # completar URL y anon key del proyecto Supabase
npm run dev                      # http://localhost:3000
```

Requisitos en Supabase: migraciones `0001` y `0002` aplicadas, clínica y usuaria dadas de alta (sección 13 de `0001`).

| Script | Qué hace |
|---|---|
| `npm run dev` | Desarrollo |
| `npm run build` | Build de producción |
| `npm test` | Tests unitarios y de componentes (Vitest) |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |

### Vista previa sin Supabase (solo desarrollo)

`/dev/<pantalla>` renderiza cada pantalla con los datos de ejemplo del diseño, sin conexión a la base:
`/dev/login`, `/dev/inicio`, `/dev/resultados`, `/dev/sin-resultados`, `/dev/vacio`, `/dev/ficha?tab=resumen|visitas|antecedentes|archivos|datos`, `/dev/nuevo-paciente`, `/dev/captura`, `/dev/nueva-visita`.
En producción esas rutas responden 404.

## Arquitectura (spec 03)

```
src/
  app/                      páginas: solo cargan datos y componen
    (auth)/                 login, recuperar contraseña
    (app)/                  app autenticada (AppShell)
    auth/callback|signout   route handlers
    dev/                    vista previa con datos de ejemplo
  components/
    ui/                     nivel 1 · primitivos sin dominio
    shared/                 nivel 2 · transversales (2+ pantallas)
    features/               nivel 3 · por pantalla
  lib/
    supabase/               clientes browser / server / middleware
    data/                   lecturas (solo servidor)
    actions/                Server Actions (escrituras, validadas con zod)
    schemas/                zod compartido cliente/servidor
  hooks/                    búsqueda en vivo, subida de fotos, conexión
  types/                    database.ts (DB) y domain.ts (app)
```

Un nivel solo importa de los anteriores. Los colores son tokens de `globals.css` (`bg-gold-700`, `text-ink-muted`…), nunca hex en componentes.

### Componentes transversales (`components/shared/`)

| Componente | Dónde se usa |
|---|---|
| `AppShell`, `SideNav`, `BottomNav`, `UserMenu`, `ConnectionIndicator`, `OfflineBanner` | Toda la app |
| `PageHeader`, `BackLink`, `FormActions` | Formularios, ficha, agenda |
| `PatientRow`, `PatientIdentity`, `PatientAvatar` | Inicio, resultados, ficha, nueva visita |
| `ContactActions` (WhatsApp + Llamar) | Filas, ficha |
| `MedicalAlerts`, `AlertPill` | Filas, ficha, nueva visita, formulario |
| `TreatmentItem`, `TreatmentStatusPill`, `AppointmentStatusPill`, `PhaseTag` | Ficha, nueva visita |
| `EmptyState`, `ErrorState`, `SectionCard` | Todos los vacíos/errores, resumen |
| `DuplicateDniNotice` | Nuevo paciente, captura rápida |
| `PhotoCapture` | Captura rápida |
| `ToothPicker`, `ServicePicker` | Nueva visita (base del odontograma futuro) |

## Decisiones de implementación

- **Fotos directo a Storage desde el navegador** (`usePhotoUpload`): se comprimen a WebP (máx. 2000 px) y se suben a `{clinic_id}/{patient_id}/{file_id}.webp`; luego `registerFile` guarda la metadata. Las Server Actions tienen límite de tamaño y no sirven para binarios.
- **Varias piezas = varias filas** en `treatments` (D-05). Boca completa → `tooth = null`.
- **"Mantener la sesión"**: cookie propia `gd_remember` (30 días) o `gd_session` (se borra al cerrar el navegador). El middleware cierra la sesión si no hay ninguna.
- **Sin conexión (D-03)**: se detecta y se avisa; los botones de guardar se deshabilitan y lo escrito no se pierde. No hay cola offline.
- **Manrope autoalojada** (`@fontsource-variable/manrope`): carga sin depender de Google Fonts.
- **`types/database.ts` escrito a mano** con el formato de Supabase. Cuando tengas el proyecto enlazado, reemplázalo:
  `npx supabase gen types typescript --project-id <ref> > src/types/database.ts`

## Pendiente

- E2E con Playwright contra un Supabase de staging (spec 03 §9).
- Agenda (F08, fase 2): ruta `/agenda` con placeholder; la tabla `appointments` ya existe.
