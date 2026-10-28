# Instalación y verificación de la Torre de Control de Agentes

Esta guía deja la torre **instalada, verificada y con plan de recuperación**. Sigue el orden; cada paso dice cómo comprobar que quedó bien.

## 1. Qué es cada pieza

| Pieza | Dónde vive | Para qué sirve |
|---|---|---|
| La torre (artifact) | claude.ai, enlace privado | La pantalla 3D, Jarvis, la bandeja, el sistema |
| Base de datos de la torre | Dentro del artifact (colecciones) | Agentes, tareas, bandeja, obras, memoria, mejoras |
| Rutinas programadas | Claude (tareas programadas) | Vigilante cada hora, aviso diario de Nesty, búsqueda de oportunidades |
| Repositorio | GitHub, rama `claude/fervent-lovelace-phzaqj` | Código, pruebas, respaldos, guías |
| Telegram (pendiente) | Tu teléfono | Alertas y respuestas fuera de la torre |

## 2. Orden de activación

1. **Abrir la torre dentro de Claude** (no en una pestaña suelta): así se conectan la base de datos, Claude y la sala en vivo.
   *Comprobar:* pestaña **Sistema** → «Base de datos compartida» y «Claude» en verde.
2. **Permitir a Claude en la torre** la primera vez que Jarvis conteste. *Comprobar:* escribe «estado» y luego una pregunta libre.
3. **Voz:** toca la pantalla una vez; Jarvis habla solo al abrir. *Comprobar:* «Voz de los agentes» en verde.
4. **Micrófono (opcional):** toca «Hablar». Si el marco lo bloquea, escribe o dicta con el teclado. *Comprobar:* «Micrófono».
5. **Rutinas:** ya creadas en Claude. *Comprobar:* lista de tareas programadas; ninguna debe estar en rojo.
6. **Telegram (pendiente):** ver `PENDIENTES.md`. Nunca pegues el token en el chat ni en archivos; solo como variable de entorno `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID`.
7. **Conexiones reales**, de una en una y siempre en solo lectura primero (Gmail, Calendar, HubSpot, QuickBooks).

## 3. Verificación

- **Dentro de la torre:** pestaña **Sistema y mejoras** → «Verificar ahora». Muestra base de datos, Claude, acciones de Jarvis, voz, micrófono, avisos, gráficos 3D, integridad de datos, errores y respaldo. «Reparar datos» corrige estados inválidos.
- **En el repositorio:** `python3 setup/verificar_setup.py` (con `--red` prueba Telegram). Revisa archivos, HTML, llaves escritas por error, Python y el respaldo. También corre solo en GitHub (`.github/workflows/verificar-torre.yml`).
- **Pruebas de la torre** (necesitan Playwright): `pruebas/sistema.js`, `pisos.js`, `voz.js`, `func.js`, `func2.js`, `seguridad.js`.

## 4. Qué hacer si algo falla

| Síntoma | Causa probable | Solución |
|---|---|---|
| Pantalla negra o vista simplificada | La tarjeta gráfica no respondió | «Reintentar», o calidad **baja** en «Más herramientas» |
| Jarvis no habla | El navegador exige un toque primero | Toca la pantalla una vez |
| Algunos agentes no hablaban | Una voz remota fallaba | Corregido: se usa una sola voz local con reintento |
| Micrófono bloqueado | El marco de Claude no lo permite | Escribe en el cuadro de Jarvis o dicta con el teclado |
| «Sin conexión» en la base de datos | La torre se abrió fuera de Claude | Ábrela desde su enlace en claude.ai |
| Datos raros o pantallas vacías | Documento mal formado | Sistema → «Reparar datos» |
| Se perdió información | Borrado por error | Restaurar desde el respaldo (sección 5) |

## 5. Respaldos y recuperación

- **Descarga manual:** Sistema → «Descargar respaldo» (JSON con agentes, tareas, bandeja, obras, publicaciones, memoria, grupos, mejoras y tokens). Hazlo semanalmente; la torre te avisa si pasan 7 días.
- **Respaldo en el repositorio:** `base-de-datos/respaldo-db.json`. Para restaurar, pídele a Claude Code: «restaura la base de datos de la torre desde el respaldo».
- **Versiones:** cada publicación del artifact guarda una versión; también están los commits de la rama.

## 6. Reglas que no se rompen

- Nada sale a clientes, correos, redes ni terceros sin tu «sí» explícito (`REGLAS.md`).
- Antes de activar cualquier skill, sistema o conexión, los agentes verifican origen, versión, qué ejecuta, qué puede tocar y que no haya secretos expuestos (`SEGURIDAD.md`).
- Jarvis puede reiniciar o pausar agentes, crear tareas, anotar memoria y mejoras; **no** puede aprobar recados, enviar mensajes ni tocar cobros.
