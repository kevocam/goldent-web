# F03 · Ficha del paciente

**Pantallas:** `design/screens/04-ficha.html` (las 5 pestañas, prop `tab`), `15-ficha-movil.html` · **Fase:** MVP

## User story
Como doctora, quiero abrir a un paciente y ver de un vistazo quién es, sus alertas médicas y qué le hice, para atenderlo con seguridad.

## Encabezado (fijo en todas las pestañas)
- Volver a "Pacientes".
- Avatar · **nombre (32/800)** · HC · edad · DNI · celular.
- Botones: **WhatsApp**, **Llamar**, **Nueva visita** (primario).
- **Alertas médicas** siempre visibles bajo el nombre (antecedentes activos con `is_alert`).

## Pestañas
Ruta: `/pacientes/[id]?tab=resumen|visitas|antecedentes|archivos|datos`

### Resumen
- **Última visita:** fecha, motivo, tratamientos con estado y pieza, nota. "Ver todas" → pestaña Visitas.
- **Tratamientos pendientes:** `treatments.status in (planned, in_progress)`.
- **Próxima cita** (fase 2): oculta hasta tener agenda.
- **Archivos recientes:** últimas 3 miniaturas. "Ver todos" → pestaña Archivos.

### Visitas y tratamientos
- Contador "N visitas" y filtro: Todos · En proceso · Planificados · Realizados.
- Línea de tiempo descendente: fecha (día/año), motivo, tratamientos (nombre, "Pieza 46" o "General", estado), nota.
- Si el paciente tiene archivos `paper_record`, al final de la línea de tiempo aparece "Historia digitalizada desde formato en papel · N páginas · Ver en Archivos". **No es una visita en la DB**, se arma en la UI.
- Tocar un tratamiento permite cambiar su estado (ej. En proceso → Realizado).

### Antecedentes
- Lista de las 9 condiciones con Sí/No y detalle. "Actualizado el …" = último `updated_at`.
- **Editar** → mismo componente de F04 (interruptores + detalle).

### Archivos
- Filtros: Todos · Radiografías · Fotos intraorales · Formato en papel (con contador).
- Agrupados por fecha. Miniatura, título, detalle (ej. "Pieza 46 · inicial", "Página 1 de 2").
- **Subir** (galería/archivos) y **Tomar foto** (cámara). Al subir: elegir tipo, pieza o descripción opcional.
- Tocar una miniatura → visor a pantalla completa con zoom.
- Imágenes con signed URL (expira en 1 h).

### Datos personales
- Tabla de solo lectura: nombres, apellidos, DNI, fecha de nacimiento + edad, celular, correo, domicilio, ocupación, estado civil, "Registrada: fecha · desde formato en papel" si tiene `legacy_record_number` o archivos `paper_record`.
- **Editar** → formulario de F04 en modo edición.
- Acción secundaria **Archivar paciente** (soft delete) con confirmación.

## Datos
- `patients` por id; `patient_conditions` + `conditions`; `visits` con `treatments` + `services` (desc por `visit_date`); `files` + signed URLs.
- Edad calculada desde `birth_date`.

## Criterios de aceptación
- [ ] Las alertas se ven en todas las pestañas sin hacer scroll.
- [ ] Un paciente con 50 visitas carga en menos de 1 s.
- [ ] Cambiar estado de un tratamiento se refleja sin recargar.
- [ ] Subir una foto de 4 MB la comprime a ~300 KB WebP antes de subir.
- [ ] Archivar oculta al paciente del buscador; no se borra.
- [ ] Ficha móvil: pestañas desplazables y botón "Nueva visita" fijo abajo.
