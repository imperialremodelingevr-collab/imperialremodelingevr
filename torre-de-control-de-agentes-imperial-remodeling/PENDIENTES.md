# Pendientes — Torre de Control de Agentes

## Lo que depende de ti (pagos / cuentas)
- [ ] Bot de Telegram (@BotFather, gratis) → guardar `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID` como variables del entorno (menú del entorno en la nube → Editar). Nunca pegarlos en el chat.
- [ ] Escribirle /start al bot desde tu Telegram (si no, el bot no puede escribirte).
- [ ] Cuentas de las plataformas reales que quieras conectar (correo, QuickBooks, calendario, redes) y sus planes de pago si aplican.
- [ ] Confirmar zona horaria para el reporte diario (hoy: Nueva York).

## Lo que sigue (trabajo mío)
- [ ] Prueba de alertas por Telegram: ejecutar `python3 integraciones/ejemplos_alertas.py --enviar` cuando existan token, chat y red permitida (5 ejemplos listos).
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
- [x] Ciudad con puentes futuristas (pasarelas de cristal, arcos de luz, anillos maglev, calzadas elevadas con cápsulas) y torre rediseñada (aletas, hélices de energía, anillos orbitales, partículas).
- [x] Auditoría de seguridad (26-oct): arreglada inyección de código desde datos de la base; protocolo de verificación en SEGURIDAD.md.
- [x] Agentes humanoides (cabeza amable, ropa de color, piernas que caminan), naves voladoras grandes, ascensores de cristal interactivos, planetas con texturas y bordes uniformes.
- [x] Vista interior: al acercarse (o con el botón) los agentes se sientan en escritorios futuristas con pantallas holográficas; alta definición (más detalle en robots, naves, planetas, ventanas, pisos).
- [x] Uniformes con logo EVR (gorra, pecho, espalda, cinturón de herramientas), mensajeros en los ascensores que entregan recados reales (alertas y bandeja), escritorios con placa de nombre y café.
- [x] 90/90 pruebas de botones y clics 3D + móvil.
