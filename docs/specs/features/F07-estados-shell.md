# F07 · Shell y estados

**Pantalla:** `design/screens/13-estados.html` · **Fase:** MVP

## Shell de la app
- **Tablet:** barra lateral 104 px: logo (→ Inicio), Pacientes, Agenda, Captura, indicador de conexión, avatar "Dra" (menú: cerrar sesión).
- **Móvil:** barra inferior con Pacientes, Agenda, Captura.
- Agenda muestra etiqueta "Fase 2" o se oculta hasta implementarla.

## Rutas
| Ruta | Pantalla |
|---|---|
| `/login` | F01 |
| `/` | F02 Inicio |
| `/pacientes/nuevo` | F04 |
| `/pacientes/[id]` | F03 (`?tab=`) |
| `/pacientes/[id]/editar` | F04 edición |
| `/pacientes/[id]/visitas/nueva` | F06 |
| `/captura` | F05 |
| `/agenda` | F08 (fase 2) |

## Estados (todos con un mensaje corto y una acción)
| Dónde | Título | Texto | Acción |
|---|---|---|---|
| Inicio sin pacientes | Aún no hay pacientes | Registra uno nuevo o empieza a digitalizar tus historias en papel. | Nuevo paciente · Captura rápida |
| Búsqueda sin resultados | No encontramos "q" | Prueba con el DNI o el celular. | Crear paciente |
| Ficha sin visitas | Sin visitas registradas | Cada visita guarda el motivo, los tratamientos por pieza y tus notas. | Registrar primera visita |
| Ficha sin archivos | Sin archivos | Agrega radiografías, fotos intraorales o el formato en papel. | Tomar foto · Subir archivo |
| Cargando | Skeletons con la forma del contenido | | |
| Error al cargar | No pudimos abrir la ficha | Revisa la conexión e inténtalo otra vez. No se perdió ningún dato. | Reintentar |
| Guardado | Toast: "Visita guardada · Rosa Quispe · 2 tratamientos" | | Ver |

## Sin conexión (D-03)
- Indicador lateral: verde "En línea" → naranja "Sin conexión" (`navigator.onLine` + eventos).
- Banner: "Sin conexión. Los cambios no se pueden guardar hasta que vuelva la señal."
- Botones de guardar deshabilitados mientras no haya red; los formularios conservan lo escrito.
- **No** se implementa la cola offline ni el "N cambios pendientes de sincronizar" del diseño en el MVP.

## Criterios de aceptación
- [ ] Cada pantalla tiene su estado vacío, de carga y de error.
- [ ] Al cortar la red, el indicador cambia en menos de 2 s y no se pierde lo escrito.
- [ ] Navegación funcional en tablet y móvil.
