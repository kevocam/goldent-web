# Spec 00 · Overview

| | |
|---|---|
| **Proyecto** | Goldent · Historia clínica digital |
| **Cliente** | Goldent Consultorio Odontológico (1 sede, 1 odontóloga) |
| **Usuaria** | La doctora. Atiende sola, sin recepcionista. |
| **Dispositivo** | Tablet primero (iPad 11", 1194×834), luego celular (390×844) |
| **Stack** | Next.js (App Router) + TypeScript · Supabase (Auth, Postgres, Storage) · Vercel |
| **Diseño fuente** | `design/GOLDENT___App_clinica.html` (17 pantallas) |

## 1. Problema

Cada paciente tiene una historia clínica en papel llenada a mano. Buscarla es lento, se deteriora y no hay forma de contactar al paciente rápido.

## 2. Objetivo del MVP

1. Encontrar la historia de un paciente **en segundos** (nombre, DNI, celular o N.º de historia).
2. Contactarlo por **WhatsApp o llamada** con un toque.
3. Registrar visitas y tratamientos por pieza dental.
4. Digitalizar las historias antiguas **a mano**, rápido: 4 datos + foto del formato.

## 3. Alcance por fase

| Fase | Incluye | Estado |
|---|---|---|
| **MVP** | Login, Inicio/Buscador, Ficha (5 pestañas), Nuevo paciente, Captura rápida, Nueva visita, Estados | 🚧 En construcción |
| **Fase 2** | Agenda semanal y diaria, citas, recordatorio por WhatsApp | Diseñada, DB lista |
| **Fase 3** | Landing pública, dominio, Google Business Profile | Pendiente |

**Fuera de alcance:** cobros (presupuesto/abono/saldo), odontograma interactivo, OCR, recorte automático de fotos, firma digital, multi-sede, portal de pacientes, funcionamiento offline real (ver D-03).

## 4. Specs

| Spec | Contenido |
|---|---|
| [01 · Modelo de datos](01-data-model.md) | Tablas, reglas, RLS, Storage ✅ |
| [02 · Design system](02-design-system.md) | Colores, tipografía, componentes |
| [03 · Arquitectura frontend](03-frontend-architecture.md) | Carpetas, componentes por nivel, páginas, datos |
| [F01 · Login](features/F01-login.md) | |
| [F02 · Inicio y buscador](features/F02-inicio-buscador.md) | |
| [F03 · Ficha del paciente](features/F03-ficha-paciente.md) | |
| [F04 · Nuevo / editar paciente](features/F04-nuevo-paciente.md) | |
| [F05 · Captura rápida](features/F05-captura-rapida.md) | |
| [F06 · Nueva visita](features/F06-nueva-visita.md) | |
| [F07 · Estados y shell](features/F07-estados-shell.md) | Navegación, vacíos, errores, sin conexión |
| [F08 · Agenda](features/F08-agenda.md) | Fase 2 |
| [Backlog](backlog.md) | Tareas por orden de implementación |

## 5. Decisiones

| # | Decisión | Detalle |
|---|---|---|
| D-01 | Sin backend propio | El front habla con Supabase; la seguridad vive en RLS. |
| D-02 | Ingreso 100% manual | La foto del papel solo se archiva. Sin OCR. |
| D-03 | **Offline: solo aviso en el MVP** | El diseño promete "funciona sin conexión". En el MVP se detecta la caída de red y se muestra el aviso, pero **no** se guardan cambios offline. La cola offline real va a fase posterior (ver riesgos). |
| D-04 | Sin recorte automático | El diseño dice "se recorta automáticamente". MVP: solo compresión. Recorte, en fase posterior. |
| D-05 | Varias piezas = varias filas | En Nueva visita se pueden elegir varias piezas; se crea un `treatment` por pieza. "Boca completa" = `tooth` vacío. |
| D-06 | DNI obligatorio solo en Nuevo paciente | En Captura rápida es opcional (historias antiguas incompletas). La DB lo permite vacío. |
| D-07 | Formato de historia `HC-00001` | 5 dígitos, como en el diseño (migración 0002). |

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| Internet inestable en el consultorio | Validar con la doctora. Si es frecuente, priorizar la cola offline. |
| Volumen de historias antiguas | Captura rápida optimizada para menos de 1 minuto por historia. |
| Datos de salud (Ley 29733) | RLS, bucket privado, signed URLs, plan Pro con backups. |
| Plan free de Supabase sin backups | Pasar a Pro antes de cargar datos reales. |

## 7. Definición de terminado (MVP)

- La doctora puede buscar, crear, digitalizar y registrar visitas desde la tablet sin ayuda.
- Funciona en Safari iPad y Chrome Android.
- Desplegado en Vercel con URL de testing.
- 20 pacientes reales cargados en la prueba sin errores bloqueantes.
