# Seguridad de la Torre de Control

## Protocolo: cada vez que se instala o activa un skill, sistema o conexión
Antes de usarlo, TODOS los agentes (y quien lo instale) verifican, en este orden:
1. **Origen:** ¿viene del repositorio/canal oficial? (no copias de terceros). Versión fijada, no "latest".
2. **Qué ejecuta:** ¿trae hooks, scripts de instalación o comandos de shell? ¿qué permisos pide (archivos, red, cuentas)? Se lee el código antes de activarlo.
3. **Qué toca:** ¿puede enviar mensajes, leer cuentas, borrar o modificar datos? Si sí, queda bloqueado hasta que Ernesto diga **sí**.
4. **Secretos:** que no haya tokens/claves en archivos, chats ni registros; que lleguen solo por variables del entorno.
5. **Prueba de la torre:** correr las pruebas de `pruebas/` (botones, clics, móvil) y `pruebas/seguridad.js` (datos maliciosos no deben ejecutarse).
6. **Reglas fijas:** confirmar que `REGLAS.md` sigue vigente (nada se envía ni se contesta sin el sí de Ernesto).
7. **Aviso:** informar a Ernesto del resultado (Nesty O Bot) y registrarlo en el log de la torre. Si algo falla: no se activa, se avisa.

## Auditoría del 26-oct-2026
- **Corregido:** datos de la base de datos que se insertaban en la página sin limpiar (progreso de obras, llamadas/tokens de uso, recurrencia de tareas, colores de grupos). Con datos maliciosos se ejecutaba código; ahora se convierten a números/colores válidos. Verificado con `pruebas/seguridad.js` (0 inyecciones).
- **Revisado y correcto:** textos (nombres, títulos, cuerpos, notas) pasan por `esc()`; no hay `eval`, `document.write` ni enlaces a otras páginas; no hay claves en el código.
- **Pendiente (recomendado):** añadir verificación de integridad (SRI) a three.js desde el CDN con el hash verificado; esa red estaba bloqueada en la auditoría, por eso no se puso a ciegas.
- **Acceso a la base de datos:** la torre es privada; solo quien tú compartas puede ver/editar. Comparte únicamente con personas de confianza.
- **Token de Telegram:** quedó expuesto en un chat; cambiarlo con `/revoke` en @BotFather y guardar el nuevo solo como variable del entorno.

## Revisión de seguridad del 17-nov-2026 (sitio web + API de contacto + torre)
- **Corregido en el sitio** (`vercel.json`): cabeceras HSTS (HTTPS forzado), CSP, X-Frame-Options, nosniff, Referrer-Policy y Permissions-Policy. Verificado en navegador: todas las páginas cargan y no hay violaciones de CSP.
- **Corregido en `api/contact.js`**: validación en el servidor (largos, correo, teléfono, servicio de una lista), solo acepta JSON y solo desde el propio sitio, límite de 5 envíos por IP cada 10 min (429), campo trampa para robots, sin saltos de línea en asuntos (inyección de cabeceras), HTML escapado, errores sin datos personales en los registros. 17 pruebas pasan.
- **Corregido en dependencias**: `npm audit` pasó de 8 vulnerabilidades a 0 (Vite y react-router-dom 7.18.5). No había paquetes sin uso.
- **GitHub Actions**: el flujo ahora tiene `permissions: contents: read`.
- **Sin secretos**: ni en los archivos, ni en el build, ni en los 81 commits del historial (patrones de claves de Resend, Stripe, AWS, Google, GitHub, Slack y Telegram).
- **Pendiente (lo hace el dueño)**: ver el informe de la revisión: hacer privado el repositorio, cambiar el token de Telegram, revocar la llave de Bland.ai y activar el límite de peticiones global en Vercel.
