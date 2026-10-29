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
- [x] Ropa de oficina (saco con solapas, camisa y corbata, gafete con logo, pañuelo, gemelos, zapatos, peinados, lentes) y voz: los agentes piden ayuda hablando («Voz») y la torre te escucha («Hablar»: estado, reinicia X, abre bandeja…). Nada se envía afuera sin tu «sí».
- [x] Jarvis, agente principal (piso Reportes): al entrar abre el informe (todo bien / requiere atención / por mejorar), lo lee en voz alta si la Voz está activa, y recibe órdenes escritas (cuadro de texto) cuando el micrófono está bloqueado. Preguntas libres van a Claude solo como sugerencias.
- [x] Agente Oportunidades (piso 12) sin llaves: tarea programada diaria (lun–sáb 11:23 Chicago) busca fixer-upper en McKinney/Plano/Frisco con búsqueda web y deja propuestas en la bandeja. Primeras 3 propiedades reales cargadas (verificar disponibilidad). Limitación: los portales (Redfin, Zillow) no se pueden abrir desde la nube; se usan resultados de búsqueda.
- [x] Torre de cristal rectangular con oficinas por agente y tablero de recados; Jarvis acoplado a un costado, habla solo al abrir (voz activa por defecto) con agentes trabajando y cambios desde la última visita; cada agente dice su avance al tocarlo; taxis y barcazas aéreas con pasajeros y puertos aéreos; ciudad con edificios futuristas.
- [x] Jarvis conversacional (Claude con herramientas: enfoca agentes, reinicia/pausa, crea tareas, anota memoria y mejoras; micrófono y manos libres), pestaña Sistema y mejoras (salud, reparar datos, respaldo, lista de mejoras por sección), voz de agentes corregida (una voz local con reintento; el recorrido de Jarvis se detiene al elegir un agente), guía SETUP.md y verificación setup/verificar_setup.py.
- [x] Micrófono dentro de la barra de Jarvis (escribe lo que dices; «enviar al hablar» lo manda directo), botón de Jarvis animado con ilusión óptica que reacciona (habla, escucha, alerta) y modo «Siempre atento» (di «Jarvis…» mientras estés en la torre).
- [x] Defensa: drones y barcazas aéreas disparan láser y destruyen en el aire parte de los meteoritos de alerta (el piso afectado sigue marcado); cada agente trae su equipo de especialista (casco, audífonos, cámara, binoculares, etc.) y props en su escritorio; los agentes te llaman solos con silbido, «Hey, jefe», globo, señal sobre la cabeza y parpadeo en el directorio (botón «Llamados» en Más herramientas).
- [x] Telegram vía Composio (sin pegar tokens en el chat): enlace de conexión creado; falta que Ernesto lo abra, pegue el token del bot SOLO ahí y escriba /start al bot. WhatsApp: requiere cuenta de WhatsApp Business (API de Meta).
- [x] 90/90 pruebas de botones y clics 3D + móvil.

- Teléfono: las naves/drones se ven en todos los niveles de calidad, los meteoros y las intercepciones ya no se apagan en calidad baja o con "reducir movimiento", el automático en móvil no baja de nivel 2, el directorio de pisos arranca cerrado en pantallas chicas y la cámara inicial es más abierta (se ve el cielo).
