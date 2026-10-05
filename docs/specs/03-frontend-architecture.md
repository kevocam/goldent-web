# Spec 03 · Arquitectura frontend

| | |
|---|---|
| **Stack** | Next.js 15 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4 |
| **Datos** | `@supabase/ssr` · Server Components para leer · Server Actions para escribir |
| **Formularios** | `react-hook-form` + `zod` (mismo schema en cliente y en la Server Action) |
| **Íconos** | `lucide-react` |
| **Tests** | Vitest + Testing Library (componentes) · Playwright (flujos E2E) |
| **Referencias** | [01 Modelo de datos](01-data-model.md) · [02 Design system](02-design-system.md) · `features/F01…F08` · `design/screens/*.html` |

Orden de construcción: **tokens → primitivos (`ui/`) → componentes transversales (`shared/`) → componentes de feature → páginas.** Un nivel solo importa de los niveles anteriores.

---

## 1. Estructura de carpetas

```
src/
  app/
    (auth)/
      login/page.tsx
      reset-password/page.tsx
    (app)/
      layout.tsx                     AppShell + OnlineStatusProvider + Toaster
      page.tsx                       Inicio / buscador
      captura/page.tsx
      agenda/page.tsx                fase 2
      pacientes/
        nuevo/page.tsx
        [id]/
          page.tsx                   Ficha (?tab=)
          loading.tsx
          error.tsx
          editar/page.tsx
          visitas/nueva/page.tsx
    auth/callback/route.ts           callback de recuperar contraseña
    layout.tsx                       <html lang="es-PE">, Manrope
    globals.css                      tokens (@theme)
  components/
    ui/                              nivel 1 · primitivos sin dominio
    shared/                          nivel 2 · transversales con dominio
    features/
      search/  patient/  patient-form/  capture/  visit/  files/  auth/
  lib/
    supabase/   client.ts  server.ts  middleware.ts
    data/       patients.ts  visits.ts  files.ts  catalogs.ts   (lecturas, solo server)
    actions/    patients.ts  visits.ts  treatments.ts  files.ts (Server Actions)
    schemas/    patient.ts  visit.ts  capture.ts                (zod)
    format.ts   phone, fechas, edad, HC
    contact.ts  whatsappUrl, telUrl
    teeth.ts    FDI: arcadas permanentes y temporales
    images.ts   compresión a WebP
    constants.ts estados, motivos, estados civiles, placeholders de antecedentes
  hooks/
    use-debounce.ts  use-online-status.ts  use-patient-search.ts  use-photo-upload.ts
  types/
    database.ts                      generado: supabase gen types typescript
    domain.ts                        tipos de la app
  middleware.ts                      refresca sesión y protege (app)
```

---

## 2. Tipos de dominio

```ts
// types/domain.ts
import type { Database } from './database';
type Tables = Database['public']['Tables'];

export type Patient       = Tables['patients']['Row'];
export type Visit         = Tables['visits']['Row'];
export type Treatment     = Tables['treatments']['Row'];
export type Service       = Tables['services']['Row'];
export type Condition     = Tables['conditions']['Row'];
export type PatientFile   = Tables['files']['Row'];

export type TreatmentStatus   = 'planned' | 'in_progress' | 'done';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'done' | 'cancelled' | 'no_show';
export type FileKind          = 'paper_record' | 'xray' | 'photo' | 'consent' | 'other';
export type MaritalStatus     = 'soltero' | 'casado' | 'conviviente' | 'divorciado' | 'viudo';

/** Lo que devuelven search_patients y recent_patients */
export interface PatientCard {
  id: string;
  record_number: string;           // HC-00248
  legacy_record_number: string | null;
  first_names: string;
  last_names: string;
  dni: string | null;
  phone: string | null;
  age: number | null;
  alerts: string[];                // ["Alergia: penicilina", "Diabetes"]
  last_visit: string | null;       // ISO date
}

export interface PatientCondition {
  conditionId: string;
  code: string;
  label: string;
  active: boolean;
  detail: string | null;
  placeholder: string;
}

export interface VisitWithTreatments extends Visit {
  treatments: (Treatment & { service: Pick<Service, 'id' | 'name'> })[];
}

export interface FileWithUrl extends PatientFile {
  url: string;                     // signed URL, 1 h
}

/** Tratamiento en edición dentro de Nueva visita (aún no guardado) */
export interface DraftTreatment {
  key: string;
  serviceId: string;
  serviceName: string;
  teeth: string[];                 // [] + wholeMouth = boca completa
  wholeMouth: boolean;
  status: TreatmentStatus;
  notes?: string;
}
```

---

## 3. Nivel 1 · Primitivos (`components/ui/`)

Sin conocimiento del dominio. Todos aceptan `className` y reenvían `ref`. Estilos con los tokens de [02](02-design-system.md).

| Componente | Props clave | Notas |
|---|---|---|
| `Button` | `variant: 'primary' \| 'secondary' \| 'whatsapp' \| 'ghost' \| 'danger'`, `size: 'md' \| 'lg' \| 'icon'`, `loading`, `asChild` | md 52 px, lg 64 px, icon 52×52. `loading` deshabilita y muestra spinner (evita doble envío) |
| `IconButton` | `icon`, `label` (obligatorio → `aria-label`), `variant` | Envuelve `Button size="icon"` |
| `Input` | `label`, `error`, `hint`, `prefix` (`+51`), `suffix`, `inputMode` | 52 px. `error` en rojo debajo |
| `Textarea` | `label`, `error`, `rows` | |
| `DateInput` | `label`, `value`, `onChange`, `max` | `type="date"` nativo (mejor teclado en iPad) |
| `Field` | `label`, `required`, `error`, `children` | Envoltorio de label + mensaje; usado por los demás |
| `Chip` | `selected`, `onClick`, `children` | `aria-pressed` |
| `ChipGroup` | `options: {value,label}[]`, `value`, `onChange`, `multiple?` | Selección única o múltiple |
| `SegmentedControl` | `options`, `value`, `onChange` | Permanente/Temporal, Día/Semana, estado del tratamiento |
| `Switch` | `checked`, `onChange`, `label`, `onLabel='Sí'`, `offLabel='No'`, `tone: 'alert' \| 'default'` | `role="switch"` |
| `Card` | `padding`, `as` | Blanco, radio 20 |
| `Pill` | `bg`, `fg`, `icon` | Base de `AlertPill` y `StatusPill` |
| `Tabs` | `tabs: {id,label,count?}[]`, `value`, `onChange` o `hrefFor(id)` | Accesible con teclado; en móvil scroll horizontal |
| `Avatar` | `name`, `size` | Iniciales: primer nombre + primer apellido |
| `Skeleton` | `className` | |
| `Spinner` | `size` | |
| `Dialog` | `open`, `onOpenChange`, `title`, `children` | Confirmaciones, visor de imagen |
| `ConfirmDialog` | `title`, `description`, `confirmLabel`, `tone`, `onConfirm` | Cancelar con datos, archivar |
| `Toast` / `Toaster` | `toast({ title, description, action })` | Abajo al centro, 4 s |

---

## 4. Nivel 2 · Componentes transversales (`components/shared/`)

Conocen el dominio y se repiten en **2 o más pantallas**. Son el corazón del reuso.

| Componente | Props | Usado en |
|---|---|---|
| `AppShell` | `children` | Todo `(app)` |
| `SideNav` | `current` | Tablet: logo, Pacientes, Agenda, Captura, `ConnectionIndicator`, `UserMenu` |
| `BottomNav` | `current` | Móvil |
| `UserMenu` | — | Avatar "Dra" → cerrar sesión |
| `ConnectionIndicator` | — | Lee `useOnlineStatus`: verde "En línea" / naranja "Sin conexión" |
| `OfflineBanner` | — | Aviso global cuando no hay red (D-03) |
| `PageHeader` | `title`, `subtitle?`, `back?: {href,label}`, `actions?` | Todas las páginas internas |
| `FormActions` | `onCancel`, `submitLabel`, `submitting`, `disabled` | Arriba y abajo en F04, F06 |
| `PatientAvatar` | `firstNames`, `lastNames`, `size` | Filas, ficha, móvil |
| `PatientIdentity` | `patient`, `layout: 'row' \| 'header' \| 'compact'` | Nombre + `HC · edad · DNI · celular`. Filas, encabezado de ficha, Nueva visita, agenda |
| `PatientRow` | `patient: PatientCard`, `showLastVisit?`, `href` | Inicio (recientes y resultados), móvil, agenda |
| `ContactActions` | `phone`, `name`, `size`, `message?` | WhatsApp + Llamar. Deshabilitado sin celular. Filas, ficha, agenda |
| `AlertPill` | `label` | Píldora roja de alerta médica |
| `MedicalAlerts` | `alerts: string[]`, `max?` | Lista de `AlertPill`; con `max` colapsa a "N alertas". Filas, ficha, Nueva visita, agenda |
| `TreatmentStatusPill` | `status: TreatmentStatus` | Ficha (resumen, visitas), Nueva visita |
| `AppointmentStatusPill` | `status: AppointmentStatus` | Agenda, Inicio, ficha (fase 2) |
| `TreatmentItem` | `name`, `tooth`, `status`, `onRemove?`, `onStatusChange?` | "Pieza 46" o "General". Resumen, timeline, lista de Nueva visita |
| `EmptyState` | `icon`, `title`, `description`, `actions` | Todos los vacíos y "sin resultados" de F07 |
| `ErrorState` | `title`, `description`, `onRetry` | `error.tsx` de cada ruta |
| `SectionCard` | `title`, `action?: {label,href}`, `children` | "Última visita · Ver todas", "Archivos recientes · Ver todos", "Citas de hoy" |
| `DuplicateDniNotice` | `dni`, `excludeId?` | Consulta en vivo; "No está registrado" o "Ya existe: … · HC" con enlace. F04 y F05 |
| `PhotoCapture` | `pages: CapturedPhoto[]`, `onAdd`, `onRemove`, `label` | Cámara trasera + miniaturas numeradas. F05 y pestaña Archivos |
| `ToothPicker` | `value: string[]`, `onChange`, `wholeMouth`, `onWholeMouthChange` | Selector FDI con Permanente/Temporal. F06 (y odontograma futuro) |
| `ServicePicker` | `services: Service[]`, `value`, `onChange` | Chips agrupados por `category`. F06 |

**Regla:** si un componente de feature empieza a usarse en una segunda pantalla, se mueve a `shared/`.

---

## 5. Nivel 3 · Componentes de feature (`components/features/`)

| Carpeta | Componente | Tipo | Responsabilidad |
|---|---|---|---|
| `auth/` | `LoginForm` | client | Correo, contraseña, mantener sesión, errores |
| | `ResetPasswordForm` | client | Pedir correo / definir nueva clave |
| `search/` | `PatientSearchBox` | client | Input 84 px, autofocus, limpiar |
| | `SearchResults` | client | Contador + `PatientRow[]` + `EmptyState` sin resultados con atajos prellenados |
| | `RecentPatients` | server | `PatientRow[]` con `showLastVisit` |
| | `HomeHeader` | server | Fecha + saludo + botones Captura / Nuevo |
| | `TodayAppointmentsCard` | server | Citas de hoy reales → agenda del día |
| `patient/` | `PatientHeader` | server | `PatientAvatar` + `PatientIdentity` + `ContactActions` + "Nueva visita" + `MedicalAlerts` |
| | `PatientTabs` | client | `Tabs` sincronizado con `?tab=` |
| | `SummaryTab` | server | Última visita, pendientes, archivos recientes |
| | `VisitsTab` | client | Filtro por estado + `VisitTimeline` |
| | `VisitTimeline` | client | Visitas desc + entrada "digitalizada desde papel" |
| | `VisitCard` | client | Fecha, motivo, `TreatmentItem[]`, nota |
| | `ConditionsTab` | server | Lista Sí/No con detalle + Editar |
| | `PersonalDataTab` | server | Tabla de datos + Editar + Archivar |
| | `ArchivePatientButton` | client | `ConfirmDialog` → `archivePatient` |
| `patient-form/` | `PatientForm` | client | Formulario completo (crear y editar), RHF + zod |
| | `PersonalDataFields` | client | Campos personales + edad en vivo + `DuplicateDniNotice` |
| | `MaritalStatusField` | client | `ChipGroup` |
| | `ConditionsFields` | client | Lista de `ConditionToggle` + contador de alertas |
| | `ConditionToggle` | client | `Switch` + detalle desplegable con placeholder |
| `capture/` | `QuickCaptureForm` | client | 4 campos + `PhotoCapture` + Guardar y siguiente / salir |
| | `CaptureSessionBar` | client | Contador de sesión + Terminar |
| | `LastSavedBanner` | client | "Guardada: … · HC · N páginas" + Deshacer (30 s) |
| `visit/` | `VisitForm` | client | Fecha, motivo, lista de tratamientos, guardar |
| | `ReasonField` | client | Texto + chips Dolor/Control/Limpieza/Urgencia/Estética |
| | `TreatmentBuilder` | client | 4 pasos: `ServicePicker` → `ToothPicker` → estado → notas → Agregar |
| | `DraftTreatmentList` | client | `TreatmentItem[]` con quitar, vacío "Aún no agregas tratamientos" |
| `files/` | `FilesTab` | client | Filtros por tipo, agrupación por fecha, subir / tomar foto |
| | `FileGrid` | client | Miniaturas agrupadas |
| | `FileThumbnail` | client | RX oscuro / foto rosa / papel crema |
| | `FileUploadDialog` | client | Tipo, pieza, descripción → subir |
| | `FileViewer` | client | `Dialog` a pantalla completa con zoom |

---

## 6. Páginas

Cada página **solo compone** componentes; no contiene estilos ni lógica de negocio propia.

### `/login` · F01
- **Tipo:** server (redirige a `/` si hay sesión) → `LoginForm`.
- **Compone:** panel de marca + `LoginForm`.

### `/` · Inicio · F02
- **Tipo:** server.
- **Datos:** `getRecentPatients(6)`.
- **Compone:** `PageHeader`/`HomeHeader` · `PatientSearchBox` + `SearchResults` (client, `usePatientSearch`) · `RecentPatients` · `TodayAppointmentsCard`.
- **Estado de la búsqueda** en `?q=` para que "atrás" desde la ficha conserve los resultados.

### `/pacientes/nuevo` · F04
- **Tipo:** server → `PatientForm mode="create"`.
- **Datos:** `getConditionsCatalog()`, `getNextRecordNumber()`, prellenado desde `?q=`.
- **Acción:** `createPatient` → redirige a la ficha + toast.

### `/pacientes/[id]` · Ficha · F03
- **Tipo:** server. `?tab=resumen|visitas|antecedentes|archivos|datos`.
- **Datos:** `getPatient(id)` + `getPatientAlerts(id)` siempre; según tab: `getVisits(id)`, `getPatientConditions(id)`, `getFiles(id)` (con signed URLs).
- **Compone:** `PageHeader(back="Pacientes")` · `PatientHeader` · `PatientTabs` · tab activa (`SummaryTab` | `VisitsTab` | `ConditionsTab` | `FilesTab` | `PersonalDataTab`).
- `loading.tsx` con skeleton de encabezado + tarjetas; `error.tsx` con `ErrorState`.
- 404 si el paciente no existe o está archivado.

### `/pacientes/[id]/editar` · F04
- **Tipo:** server → `PatientForm mode="edit"` con datos y antecedentes actuales.
- **Acción:** `updatePatient`. `?seccion=antecedentes` hace scroll a esa sección (desde "Editar" en la pestaña).

### `/pacientes/[id]/visitas/nueva` · F06
- **Tipo:** server → `VisitForm`.
- **Datos:** `getPatient(id)`, alertas, `getServicesCatalog()`; `?cita=` (fase 2).
- **Compone:** `PageHeader` (nombre · HC) + `MedicalAlerts` + `VisitForm`.
- **Acción:** `createVisit` → ficha `?tab=visitas` + toast.

### `/captura` · F05
- **Tipo:** server → `QuickCaptureForm` (client, mantiene el contador de sesión en estado).
- **Datos:** `getNextRecordNumber()`.
- **Acciones:** `quickCapture`, `undoQuickCapture`; subida de fotos con `usePhotoUpload`.

### `/agenda` · F08
- **Tipo:** server. Estado en la URL: `?vista=dia|semana&fecha=&cita=&nueva=1&hora=&paciente=&editar=`.
- **Datos:** `getAppointments(desde, hasta)` (cita + paciente + alertas); `getAppointment(id)` para reprogramar.
- **Compone:** `AgendaToolbar` · `DayView` (lista + `AppointmentPanel` con `AppointmentStatusPicker` y recordatorio) | `WeekView` · `AppointmentDialog` (client).
- **Acciones:** `createAppointment`, `rescheduleAppointment`, `setAppointmentStatus` (`lib/actions/appointments.ts`). "Atender" → `/pacientes/[id]/visitas/nueva?cita=` (el trigger cierra la cita).

### Matriz de reuso

| Transversal | Inicio | Ficha | Nuevo/Editar | Captura | Nueva visita | Agenda |
|---|:-:|:-:|:-:|:-:|:-:|:-:|
| `AppShell` / navs | ● | ● | ● | ● | ● | ● |
| `PageHeader` | ● | ● | ● | ● | ● | ● |
| `PatientRow` | ● | | | | | ● |
| `PatientIdentity` | ● | ● | | | ● | ● |
| `ContactActions` | ● | ● | | | | ● |
| `MedicalAlerts` | ● | ● | | | ● | ● |
| `TreatmentItem` + `TreatmentStatusPill` | | ● | | | ● | |
| `EmptyState` / `ErrorState` | ● | ● | | | ● | ● |
| `SectionCard` | ● | ● | | | | |
| `DuplicateDniNotice` | | | ● | ● | | |
| `PhotoCapture` | | ● | | ● | | |
| `ToothPicker` / `ServicePicker` | | | | | ● | |
| `FormActions` | | | ● | ● | ● | |

---

## 7. Capa de datos

### Lecturas (`lib/data/*`, solo server, con `createServerClient`)
| Función | Fuente |
|---|---|
| `getRecentPatients(limit)` | `rpc('recent_patients')` |
| `getPatient(id)` | `patients` (no archivados) |
| `getPatientAlerts(id)` | `patient_conditions` activos + `conditions.is_alert` |
| `getPatientConditions(id)` | catálogo `conditions` con left join al paciente → `PatientCondition[]` |
| `getVisits(id)` | `visits` + `treatments` + `services`, desc |
| `getPendingTreatments(id)` | `treatments` con status `planned`/`in_progress` |
| `getFiles(id, kind?)` | `files` + `createSignedUrls` en lote (1 h) |
| `getServicesCatalog()` | `services` activos, orden `sort_order` |
| `getConditionsCatalog()` | `conditions` activos, orden `sort_order` |
| `getNextRecordNumber()` | `clinics.record_seq + 1` → `HC-00253` (solo informativo) |
| `checkDni(dni, excludeId?)` | coincidencia exacta entre pacientes activos |

### Búsqueda (cliente)
`usePatientSearch(q)`: debounce 250 ms, mínimo 2 caracteres, `rpc('search_patients')` con el cliente de navegador, cancela la petición anterior (`AbortController`).

### Escrituras (`lib/actions/*`, Server Actions)
Validan con el mismo schema zod del formulario y devuelven `{ ok: true, data } | { ok: false, error, fieldErrors? }`. Llaman `revalidatePath` de la ficha.

| Acción | Hace |
|---|---|
| `createPatient(input)` | insert `patients` + `patient_conditions` → `{ id, record_number }` |
| `updatePatient(id, input)` | update `patients` + upsert de antecedentes (`active` true/false) |
| `archivePatient(id)` | `deleted_at = now()` |
| `quickCapture(input)` | insert `patients` → `{ id, record_number }` (las fotos van aparte) |
| `undoQuickCapture(id)` | `deleted_at` en paciente y sus `files` |
| `createVisit(patientId, input)` | insert `visits` + un `treatments` por servicio y pieza |
| `updateTreatmentStatus(id, status)` | update `treatments.status` |
| `registerFile(input)` | insert `files` tras subir el binario |
| `archiveFile(id)` | `deleted_at` |

### Fotos (cliente, directo a Storage)
Las Server Actions tienen límite de cuerpo, así que los binarios **no** pasan por ellas:
1. `compressImage(file)` → WebP, máx. 2000 px, calidad 0,8 (`lib/images.ts`, canvas).
2. `supabase.storage.from('patient-files').upload('{clinic_id}/{patient_id}/{file_id}.webp')`.
3. `registerFile(...)`.
`usePhotoUpload` expone `upload(files, meta)`, progreso por archivo, reintento y errores.

---

## 8. Hooks y utilidades

| Archivo | Exporta |
|---|---|
| `hooks/use-debounce.ts` | `useDebounce(value, ms)` |
| `hooks/use-online-status.ts` | `useOnlineStatus()` + `OnlineStatusProvider` |
| `hooks/use-patient-search.ts` | `{ results, loading, error }` |
| `hooks/use-photo-upload.ts` | `{ upload, progress, retry }` |
| `lib/format.ts` | `formatPhone('951284736') → '951 284 736'`, `formatDate`, `formatLongDate` ("Lunes 5 de octubre"), `ageFrom(birthDate)`, `greeting(date)`, `fullName(p)`, `initials(p)` |
| `lib/contact.ts` | `whatsappUrl(phone, text?)`, `telUrl(phone)` |
| `lib/teeth.ts` | `PERMANENT_ARCHES`, `TEMPORARY_ARCHES`, `isValidFdi(t)`, `toothLabel(t)` → "Pieza 46" / "General" |
| `lib/constants.ts` | `TREATMENT_STATUS`, `APPOINTMENT_STATUS` (label + colores), `VISIT_REASONS`, `MARITAL_STATUS`, `CONDITION_PLACEHOLDERS` |
| `lib/schemas/*.ts` | `patientSchema`, `quickCaptureSchema`, `visitSchema` (DNI 8 dígitos, celular 9 dígitos que empieza en 9, etc.) |

Fechas con `Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima' })`.

---

## 9. Convenciones

- **Server Components por defecto.** `'use client'` solo en componentes con estado, eventos o APIs del navegador.
- Archivos en `kebab-case.tsx`, componentes en `PascalCase`, un componente exportado por archivo.
- Nada de colores hex en componentes: solo clases de los tokens.
- Toda pantalla tiene `loading.tsx` y `error.tsx` o su equivalente.
- Botones de envío con `loading` para evitar doble envío.
- Accesibilidad: objetivos ≥ 48 px, `aria-label` en botones de ícono, `role="switch"` en interruptores, foco visible en `gold-500`.
- **Nunca** usar la `service_role key` en el front. Variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

### Tests mínimos
| Nivel | Qué |
|---|---|
| Unit (Vitest) | `format.ts`, `teeth.ts`, schemas zod, `compressImage` |
| Componentes | `ToothPicker`, `ConditionToggle`, `MedicalAlerts`, `ContactActions` (deshabilitado sin celular) |
| E2E (Playwright, viewport 1194×834) | login → buscar → ficha · nuevo paciente con alerta · captura rápida con 2 fotos y deshacer · nueva visita con 2 piezas |

---

## 10. Orden de implementación

| Paso | Entrega | Backlog |
|---|---|---|
| 1 | Proyecto, tokens en `globals.css`, Manrope, Supabase clients, middleware, tipos generados | S1.1–S1.3 |
| 2 | Primitivos `ui/` completos | S1.5 |
| 3 | `AppShell`, `SideNav`, `BottomNav`, `ConnectionIndicator`, `PageHeader`, `EmptyState`, `ErrorState` + deploy | S1.4, S1.6 |
| 4 | `/login` | S2.1 |
| 5 | `PatientRow`, `PatientIdentity`, `ContactActions`, `MedicalAlerts` → `/` | S2.2 |
| 6 | `PatientHeader`, `PatientTabs`, `SummaryTab`, `PersonalDataTab` → `/pacientes/[id]` | S2.3 |
| 7 | `PatientForm` + `DuplicateDniNotice` → `/pacientes/nuevo` y `/editar` | S3.1 |
| 8 | `PhotoCapture`, `usePhotoUpload`, `compressImage` → `/captura` + `FilesTab` | S3.2–S3.4 |
| 9 | `ToothPicker`, `ServicePicker`, `TreatmentBuilder` → `/visitas/nueva` + `VisitsTab` + `ConditionsTab` | S4.1–S4.3 |
| 10 | Estados vacíos/carga/error en todo + E2E | S4.4, S5.1 |
