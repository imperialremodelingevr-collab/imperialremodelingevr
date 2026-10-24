# Pendientes — Torre de Control de Agentes

## Lo que depende de ti (pagos / cuentas)
- [ ] Bot de Telegram (@BotFather, gratis) → guardar `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID` como variables del entorno (menú del entorno en la nube → Editar). Nunca pegarlos en el chat.
- [ ] Escribirle /start al bot desde tu Telegram (si no, el bot no puede escribirte).
- [ ] Cuentas de las plataformas reales que quieras conectar (correo, QuickBooks, calendario, redes) y sus planes de pago si aplican.
- [ ] Confirmar zona horaria para el reporte diario (hoy: Nueva York).

## Lo que sigue (trabajo mío)
- [ ] Telegram de dos vías: `integraciones/telegram_bandeja.py` ya está (enviar avisos con botones Aprobar/Corregir/Rechazar y leer tus respuestas). Falta crear la rutina que revisa tus respuestas y las aplica a la bandeja de la torre, cuando existan el token y el chat.
- [ ] Conectar agentes reales, uno por uno: Correo → Cotizaciones → Atención al cliente → Publicaciones.
- [ ] Reemplazar los agentes de ejemplo por estados reales en la base de datos (colección `agents`).
- [ ] Probar que la notificación llega al teléfono.
- [ ] Detalles de perfección visual (cielo, robots, tarjetas, encuadre inicial).
- [ ] Compartir la torre con el equipo (menú Compartir del Artifact).

## Hecho
- [x] Pantalla negra corregida, calidad adaptable, vista de respaldo.
- [x] Alarmas en página + vigilante cada hora + reporte diario.
- [x] Cielo con espacio y planetas siempre visibles.
- [x] Meteoritos de alerta: caen sobre el piso del agente en rojo (falla) o ámbar (lento) con onda de choque.
- [x] 90/90 pruebas de botones y clics 3D + móvil.
