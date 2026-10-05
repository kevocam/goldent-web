# F02 · Inicio y buscador

**Pantalla:** `design/screens/02-inicio.html` (tablet), `14-inicio-movil.html` · **Fase:** MVP
**Variantes:** búsqueda vacía, con resultados, sin resultados.

## User story
Como doctora, quiero escribir parte del nombre, DNI o celular y ver al paciente al instante, para abrir su ficha o escribirle por WhatsApp.

## UI
- Encabezado: fecha de hoy ("Lunes 5 de octubre"), saludo según hora (Buenos días / tardes / noches, doctora).
- Botones: **Captura rápida** (secundario) y **Nuevo paciente** (primario).
- Buscador grande con autofocus y botón para limpiar.
- **Búsqueda vacía:** lista "Recientes" (6) + tarjeta "Citas de hoy" (fase 2: oculta o con etiqueta "Fase 2" hasta tener agenda).
- **Con resultados:** "N resultados para "q"" + filas.
- **Sin resultados:** "No encontramos "q"", sugerencia de buscar por DNI o celular, botones **Crear paciente** y **Es una historia en papel** (→ Captura rápida).

### Fila de paciente
Avatar con iniciales · nombre completo · `HC · edad · DNI · celular` · píldora de alertas (si hay más de 2: "N alertas") · fecha de última visita (solo en Recientes) · botón WhatsApp · botón Llamar.

## Datos
| Qué | Cómo |
|---|---|
| Resultados | `rpc('search_patients', { q })` → tarjetas con `alerts`, `age`, `last_visit` |
| Recientes | `rpc('recent_patients', { max_results: 6 })` |
| WhatsApp | `https://wa.me/51{celular sin espacios}` |
| Llamar | `tel:+51{celular}` |

## Comportamiento
- Búsqueda con debounce de 250 ms, a partir de 2 caracteres.
- Tolera tildes y errores leves ("gonsales" encuentra "Gonzáles").
- Acepta `HC-00012` y el número de historia en papel.
- Celular formateado `951 284 736`.
- Si "Crear paciente" viene de una búsqueda por nombre, prellenar nombres/apellidos; si son dígitos, prellenar DNI o celular.
- Tocar la fila (no los botones) abre la ficha.
- Sin celular registrado: botones WhatsApp y Llamar deshabilitados.

## Criterios de aceptación
- [ ] Resultados en menos de 500 ms con 1.000 pacientes.
- [ ] "quispe", "41827", "951284", "HC-00248" y "152" (papel) encuentran al paciente correcto.
- [ ] Las alertas médicas aparecen en rojo en cada fila.
- [ ] WhatsApp abre el chat del paciente con un toque.
- [ ] Sin resultados muestra los dos atajos de creación.
- [ ] Versión móvil con barra inferior.
