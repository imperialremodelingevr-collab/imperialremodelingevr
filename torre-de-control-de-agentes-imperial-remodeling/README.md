# Torre de Control de Agentes — Imperial Remodeling

Ciudad 3D con la torre de agentes (un piso por agente), bandeja de entrada, tareas, obras, publicaciones, tokens, memoria, estructura de grupos y alarmas cuando un agente falla.

- `index.html` — la torre completa en un solo archivo. Se publica como Artifact (capacidades `db`, `sample`, `room`).
- `base-de-datos/respaldo-db.json` — copia de la base de datos de la torre.
- `integraciones/reporte_telegram.py` — plantilla del reporte diario por Telegram (token por variable de entorno).
- `pruebas/` — pruebas automáticas (Playwright): botones, clics 3D, móvil, pantalla negra, memoria.
- `PENDIENTES.md` — lista de lo que falta para seguir trabajando.

## Publicada
https://claude.ai/artifact/SQj94nrTPP9TAWMg7MkmoM (privada)

## Rutinas programadas (nube)
- **Vigilante Torre EVR** — cada hora; avisa por push y correo si un agente falla.
- **Reporte diario Torre EVR** — todos los días 6:35 a. m. (Nueva York).

## Para seguir trabajando
Abre una sesión nueva de Claude Code en este repositorio, rama `claude/fervent-lovelace-phzaqj`, y pide: "sigue con PENDIENTES.md de la torre de control".
