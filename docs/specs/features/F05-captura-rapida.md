# F05 · Captura rápida

**Pantallas:** `design/screens/03-captura-rapida.html`, `16-captura-rapida-movil.html` · **Fase:** MVP

## User story
Como doctora, quiero digitalizar una historia en papel en menos de 1 minuto: 4 datos y fotos del formato, y pasar a la siguiente sin salir de la pantalla.

## UI
- Encabezado: "Captura rápida · Historias antiguas: 4 datos y una foto del formato. El resto se completa después."
- Contador de sesión: "12 historias digitalizadas en esta sesión" + botón **Terminar**.
- Banner de la última guardada: "Guardada: Carmen Rosa Condori Flores · HC-00243 · 3 páginas" + **Deshacer**.
- "Historia n.º 13 · HC-00253 al guardar".

### Formulario
| Campo | Regla |
|---|---|
| Nombres | requerido |
| Apellidos | requerido |
| DNI | **opcional**, 8 dígitos; verifica duplicado en vivo ("No está registrado" en verde) |
| Celular | opcional, +51 |
| N.º de historia en papel | opcional → `legacy_record_number` |

### Fotos del formato
- Botón grande **Tomar foto del formato en papel** (abre la cámara trasera: `<input type="file" accept="image/*" capture="environment">`).
- Una foto por página, miniaturas numeradas, **Otra página**, quitar página.
- Compresión en el dispositivo: máx. 2000 px de lado, WebP calidad 0,8.
- Sin recorte automático en el MVP (D-04).

### Acciones
- **Guardar y siguiente** (64 px, primario): guarda, limpia el formulario, enfoca "Nombres", incrementa el contador.
- **Guardar y salir**: guarda y vuelve a Inicio.

## Guardado
1. Insert `patients` (nombres, apellidos, DNI, celular, `legacy_record_number`).
2. Por cada página: subir a Storage en `{clinic_id}/{patient_id}/{file_id}.webp` → insert `files` (`kind = 'paper_record'`, `page_number`).
3. Si una foto falla: el paciente queda guardado, se muestra "1 página no se subió · Reintentar".

**Deshacer:** marca `deleted_at` en el paciente y sus archivos (solo el último guardado, disponible 30 s o hasta la siguiente captura).

## Criterios de aceptación
- [ ] Se puede guardar sin DNI y sin fotos.
- [ ] Una historia con 2 fotos se guarda en menos de 5 s con 4G.
- [ ] El contador y el banner se actualizan tras cada guardado.
- [ ] Deshacer quita al paciente del buscador.
- [ ] DNI duplicado bloquea el guardado y enlaza a la ficha existente.
- [ ] Buscar el N.º de historia en papel desde Inicio encuentra al paciente.
