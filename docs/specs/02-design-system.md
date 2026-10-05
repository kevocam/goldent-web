# Spec 02 · Design system

Fuente: `design/screens/00-design-system.html`. Tablet primero, Manrope, objetivos táctiles de 48 px o más, mucho blanco y dorado con medida.

## 1. Colores

| Token | Hex | Uso |
|---|---|---|
| `gold-700` | `#8A6512` | Texto dorado y botón primario (5,3:1 con blanco) |
| `gold-500` | `#C9962B` | Íconos, líneas, borde del buscador. **Nunca texto sobre blanco** |
| `gold-50` | `#FBF5E8` | Selección y navegación activa |
| `gold-900` | `#6B4E0E` | Texto sobre `gold-50` |
| `pink-300` | `#E8A6C4` | Acento: logo y avatares |
| `pink-50` | `#FCF1F6` | Fondo de avatares |
| `pink-800` | `#8A3F63` | Iniciales en avatar |
| `ink` | `#111111` | Texto principal |
| `ink-muted` | `#5B5B5F` | Texto secundario (6,7:1) |
| `border` | `#D9D4CB` | Campos, chips, botón secundario |
| `border-card` | `#E8E5DF` | Borde de tarjetas |
| `bg` | `#F7F6F3` | Fondo de la app; tarjetas en blanco |
| `red-700` | `#A3201A` | **Solo** alertas médicas y errores |
| `whatsapp` | `#13723F` | Botón WhatsApp |

### Estados de tratamiento
| Estado | DB | Fondo | Texto |
|---|---|---|---|
| Planificado | `planned` | `#EEF0F3` | `#3F4652` |
| En proceso | `in_progress` | `#FBF3E2` | `#6B4E0E` |
| Realizado | `done` | `#E5F4EC` | `#17643A` |

### Estados de cita (fase 2)
| Estado | DB | Fondo | Texto | Punto |
|---|---|---|---|---|
| Programada | `scheduled` | `#EEF0F3` | `#3F4652` | `#8C93A0` |
| Confirmada | `confirmed` | `#E6EFFA` | `#1D4F91` | `#2563B8` |
| Atendida | `done` | `#E5F4EC` | `#17643A` | `#1F8A50` |
| Cancelada | `cancelled` | `#F2F2F2` | `#5B5B5F` | — |
| No asistió | `no_show` | `#FCEBDD` | `#9A4A0B` | `#C2620F` |

**Regla:** los estados se distinguen por texto y luminosidad, no solo por color.

## 2. Tipografía (Manrope)

| Estilo | Tamaño/peso | Ejemplo |
|---|---|---|
| Display | 32/800 | Nombre del paciente en la ficha |
| H1 | 28/800, tracking −0,02em | "Buenos días, doctora" |
| Título | 24/800 | Título de sección |
| Subtítulo | 18/700–800 | "Recientes", nombre de tratamiento |
| Cuerpo | 16/500 | Notas |
| Etiqueta | 13/700 | Label de campo |
| Dato | 16/700, `tabular-nums` | DNI, celular, HC |

## 3. Componentes

| Componente | Especificación |
|---|---|
| **Botón** | alto 52 px (64 px en acciones de flujo: "Guardar y siguiente"), radio 14 px, 16/700 |
| Primario | fondo `gold-700`, texto blanco |
| Secundario | blanco, borde `border` |
| WhatsApp | fondo `whatsapp`, texto blanco. Siempre verde |
| Llamar | siempre secundario |
| Ícono | 52×52 |
| **Campo** | alto 52 px, borde `border`, foco en `gold-500`, error en `red-700` con mensaje debajo |
| **Buscador** | alto 84 px, borde 2 px `gold-500`, radio 22 px, texto 24/700 |
| **Chip** | borde `border`; seleccionado: borde `gold-700`, fondo `gold-50`, texto `gold-900` 800 |
| **Interruptor Sí/No** | pista `#CFCAC1` → `gold-700`; texto "Sí" en `red-700` (es alerta) |
| **Alerta médica** | píldora 32 px, fondo `#FDECEA`, borde `#F2B8B2`, texto `red-700` 13/700, ícono. Siempre visible bajo el nombre del paciente |
| **Tarjeta** | blanco, borde `border-card`, radio 20 px (18 en filas de lista) |
| **Avatar** | círculo 52 px, fondo `pink-50`, iniciales `pink-800` 800 |
| **Selector de piezas FDI** | cuadrícula de botones por arcada (superior/inferior, cuadrantes separados). Pestañas Permanente/Temporal. Seleccionado: fondo `gold-700`, texto blanco |

## 4. Layout

| | Tablet (≥ 768 px) | Móvil (< 768 px) |
|---|---|---|
| Navegación | Barra lateral 104 px: logo, Pacientes, Agenda, Captura, indicador de conexión, avatar "Dra" | Barra inferior: Pacientes, Agenda, Captura |
| Contenido | padding 28×32 px, gap 22 px | padding 16 px |
| Referencia | 1194×834 (iPad 11") | 390×844 |

## 5. Implementación

- Tailwind con los tokens de arriba en `tailwind.config` (o CSS variables).
- Manrope desde `next/font/google`.
- Íconos: línea simple (Lucide encaja con el diseño).
- Contraste mínimo AA. Todo botón de solo ícono lleva `aria-label`.
