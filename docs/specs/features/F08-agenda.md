# F08 · Agenda

**Pantallas:** `design/screens/11-agenda-semanal.html`, `12-agenda-dia.html` · **Fase:** 2 (DB lista: `appointments`)

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
- [ ] Crear, reprogramar y cancelar citas.
- [ ] "Atender" abre Nueva visita y al guardar la cita queda Atendida.
- [ ] "No asistió" se marca con un toque.
- [ ] Inicio muestra "Citas de hoy" real.
