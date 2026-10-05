# F01 · Login

**Pantalla:** `design/screens/01-login.html` · **Fase:** MVP

## User story
Como doctora, quiero entrar con mi correo y contraseña para ver las historias de mis pacientes, sin volver a loguearme cada día en la tablet.

## UI
- Panel izquierdo de marca: "La historia de cada paciente, a un toque." (quitar la frase de "funciona sin conexión" mientras D-03 siga vigente).
- Formulario: correo, contraseña (con mostrar/ocultar), "Mantener la sesión iniciada en esta tablet" (marcado por defecto), botón **Entrar**, enlace "¿Olvidaste tu contraseña?".

## Comportamiento
- `supabase.auth.signInWithPassword`.
- Sesión persistente por defecto; si se desmarca "mantener sesión", la sesión dura hasta cerrar el navegador.
- "¿Olvidaste tu contraseña?" → `resetPasswordForEmail` → pantalla para definir nueva contraseña.
- No hay registro público. Los usuarios se crean desde Supabase.
- Usuario sin fila activa en `staff` → "Tu cuenta no tiene acceso al consultorio" y se cierra la sesión.
- Toda ruta protegida sin sesión redirige a `/login`.

## Criterios de aceptación
- [ ] Credenciales correctas → Inicio.
- [ ] Credenciales incorrectas → "Correo o contraseña incorrectos", sin revelar cuál falló.
- [ ] Cerrar y reabrir la tablet mantiene la sesión.
- [ ] Usuario sin `staff` activo no ve ningún dato.
- [ ] Cerrar sesión desde el avatar "Dra" vuelve a `/login`.
