# Torre de Comando EVR

Ciudad 3D con la torre de agentes, bandeja, tareas, obras, publicaciones, tokens, memoria, estructura (grupos) y alarmas.

- `index.html` — la torre completa (un solo archivo). Se publica como Artifact con capacidades `db`, `sample`, `room`.
- `base-de-datos/respaldo-db.json` — copia de la base de datos (tareas, bandeja, obras, publicaciones, memoria, grupos, uso de tokens).
- `pruebas/` — pruebas automáticas (Playwright) de botones, pantalla negra y memoria.

## Alarmas
- En la página: sonido, notificación del navegador y destello cuando un agente falla.
- Con la página cerrada: tarea programada "Vigilante Torre EVR" (cada hora) avisa por push/email.

## Abrir local
`node pruebas/serve.js` sirviendo esta carpeta (usa un mock de `window.claude`), o publicar `index.html` de nuevo como Artifact.
