# F08 · Agenda

**Pantallas:** `design/screens/11-agenda-semanal.html`, `12-agenda-dia.html` · **Fase:** 2 · **Implementada** (`/agenda`, sin migraciones: usa `appointments`)

## User story
Como doctora, quiero ver mis citas de la semana y del día, marcar quién vino o faltó, y recordarles por WhatsApp.

## UI
- Selector Día / Semana, rango de fechas, **Nueva cita**.
- **Semana:** columnas lun–sáb, filas por hora; tarjetas con paciente, hora, motivo y estado.
- **Día:** lista por hora con duración; panel lateral con la cita seleccionada:
  - Paciente, HC, edad, celular, alertas.
  - Estado: Programada · Confirmada · Atendida · Cancelada · No asistió.
  - **Recordatorio por WhatsApp** con mensaje prellenado:
    > Hola, {nombre}. Le recordamos su cita en GOLDENT Consultorio Odontológico {hoy/día} a las {hora}. Responda SÍ para confirmar o escríbanos si necesita cambiar la hora. ¡Gracias!
    Enlace: `https://wa.me/51{cel}?text={mensaje codificado}`.
  - **Ver ficha**, **Reprogramar**, **Atender** (→ F06 con `appointment_id`).

## Criterios de aceptación
- [x] Crear, reprogramar y cancelar citas.
- [x] "Atender" abre Nueva visita y al guardar la cita queda Atendida.
- [x] "No asistió" se marca con un toque.
- [x] Inicio muestra "Citas de hoy" real.

## Implementación
- **URL = estado:** `/agenda?vista=dia|semana&fecha=YYYY-MM-DD&cita=<id>`; `&nueva=1[&hora=HH:MM&paciente=<id>]` abre Nueva cita y `&editar=<id>` Reprogramar. "Atrás" y los enlaces desde Inicio/Ficha funcionan sin estado en memoria.
- **Hora de Lima fija (UTC-05:00):** se guarda `starts_at` con offset `-05:00` y `ends_at = starts_at + duración` (`lib/agenda.ts`).
- **Cruces de horario:** el servidor avisa si la cita se cruza con otra activa (no cuenta canceladas ni "No asistió"); la doctora puede **Agendar igual**.
- **Día:** lista por hora con huecos libres "Libre hasta las … · Agendar" (desde ahora en adelante) y panel de la cita. En móvil el panel va arriba.
- **Semana:** lunes a sábado (domingo solo si tiene citas), 8–20 h ampliable; citas que se cruzan van lado a lado. En móvil se desplaza en horizontal.
- **Reprogramar** devuelve la cita a "Programada". **Cancelar** = estado Cancelada (no se borra).
- **Ficha · Resumen:** tarjeta "Próxima cita" con Recordatorio y Reprogramar, o "Agendar cita".
- Vista previa sin Supabase: `/dev/agenda`, `/dev/agenda?vista=semana`, `?cita=…`, `?nueva=1`.
