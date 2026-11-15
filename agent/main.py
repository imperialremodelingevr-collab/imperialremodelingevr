"""Servidor principal del agente — Imperial Remodeling EVR."""

import asyncio
import logging
import os
from collections import defaultdict
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse, PlainTextResponse

from agent.brain import generar_respuesta, obtener_mensaje_error
from agent.memory import (
    actualizar_cliente,
    crear_alerta,
    guardar_mensaje,
    inicializar_db,
    liberar_evento,
    limpiar_eventos_viejos,
    marcar_evento_procesado,
    obtener_alertas_sin_revisar,
    obtener_citas_pendientes,
    obtener_clientes_para_seguimiento,
    obtener_historial,
    registrar_cita,
)
from agent.providers import obtener_proveedor
from agent.providers.base import MensajeEntrante
from agent.tools import detectar_lead_caliente, extraer_datos_cita, generar_reporte_semanal_texto

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
REPORT_API_KEY = os.getenv("REPORT_API_KEY", "")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("agentkit")
logger.setLevel(logging.DEBUG if ENVIRONMENT == "development" else logging.INFO)

PORT = int(os.getenv("PORT", "8000"))

_candados: dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)

proveedor = None
error_configuracion: str | None = None
try:
    proveedor = obtener_proveedor()
except Exception as e:
    error_configuracion = str(e)

estado_proveedor: dict = {"ok": None, "detalle": "sin verificar"}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await inicializar_db()
    await limpiar_eventos_viejos()
    logger.info("Base de datos lista (mensajes, citas, clientes, alertas)")
    logger.info(f"Servidor Imperial Remodeling EVR escuchando en puerto {PORT}")

    global estado_proveedor
    if proveedor is not None:
        logger.info(f"Proveedor de WhatsApp: {proveedor.__class__.__name__}")
        ok, detalle = await proveedor.verificar_conexion()
        estado_proveedor = {"ok": ok, "detalle": detalle}
        logger.info(f"Conexión con el proveedor: {'OK' if ok else 'ERROR'} — {detalle}")
    else:
        logger.error(f"Proveedor NO configurado: {error_configuracion}")

    yield


app = FastAPI(title="Imperial Remodeling EVR — WhatsApp Agent", version="2.0.0", lifespan=lifespan)


@app.get("/")
async def health_check():
    if error_configuracion:
        return {"status": "error", "service": "imperial-remodeling-evr", "detalle": error_configuracion}
    return {
        "status": "ok" if estado_proveedor["ok"] else "degradado",
        "service": "imperial-remodeling-evr",
        "agente": "Sofia",
        "proveedor": proveedor.__class__.__name__ if proveedor else None,
        "conexion": estado_proveedor,
    }


@app.get("/webhook")
async def webhook_verificacion(request: Request):
    if proveedor is None:
        raise HTTPException(status_code=503, detail=error_configuracion or "Proveedor no configurado")

    respuesta = await proveedor.validar_webhook(request)
    if respuesta is not None:
        return PlainTextResponse(respuesta)

    if request.query_params.get("hub.mode") == "subscribe":
        raise HTTPException(status_code=403, detail="Verify token incorrecto")

    return {"status": "ok"}


@app.post("/webhook")
async def webhook_handler(request: Request, tareas: BackgroundTasks):
    if proveedor is None:
        raise HTTPException(status_code=503, detail=error_configuracion or "Proveedor no configurado")

    if not await proveedor.verificar_firma(request):
        raise HTTPException(status_code=401, detail="Firma del webhook inválida")

    try:
        mensajes = await proveedor.parsear_webhook(request)
    except Exception as e:
        logger.error(f"No se pudo leer el webhook: {e}")
        return {"status": "ignorado"}

    encolados = 0
    for msg in mensajes:
        if msg.es_propio or not msg.texto.strip():
            continue

        evento_id = msg.contexto.get("evento_id") or msg.mensaje_id
        if evento_id and not await marcar_evento_procesado(evento_id):
            logger.info(f"Evento repetido, se ignora: {evento_id}")
            continue

        logger.info(f"Mensaje de {msg.telefono}: {msg.texto[:80]}")
        tareas.add_task(procesar_mensaje, msg)
        encolados += 1

    return {"status": "ok", "encolados": encolados}


async def procesar_mensaje(msg: MensajeEntrante):
    evento_id = msg.contexto.get("evento_id") or msg.mensaje_id

    async with _candados[msg.telefono]:
        try:
            # Detectar si es un lead caliente y crear alerta
            es_caliente, razon_caliente = detectar_lead_caliente(msg.texto)
            if es_caliente:
                await crear_alerta(
                    telefono=msg.telefono,
                    nombre="",
                    servicio="",
                    descripcion=f"Lead caliente detectado: '{msg.texto[:150]}' | Señales: {razon_caliente}",
                    nivel="caliente",
                )
                logger.info(f"🚨 Lead caliente de {msg.telefono}: {razon_caliente}")

            # Detectar si están pidiendo cita
            texto_lower = msg.texto.lower()
            quiere_cita = any(kw in texto_lower for kw in [
                "cita", "visita", "estimación", "presupuesto", "estimate", "appointment",
                "pueden venir", "can you come", "cuándo pueden", "when can",
            ])

            historial = await obtener_historial(msg.telefono)
            respuesta, es_respuesta_real = await generar_respuesta(msg.texto, historial)

            enviado = await proveedor.enviar_mensaje(msg.telefono, respuesta, msg.contexto)

            if not enviado:
                logger.error(f"No se pudo enviar respuesta a {msg.telefono}; liberando evento")
                await liberar_evento(evento_id)
                return

            if es_respuesta_real:
                await guardar_mensaje(msg.telefono, "user", msg.texto)
                await guardar_mensaje(msg.telefono, "assistant", respuesta)

                # Actualizar estado del cliente
                estado = "prospecto" if quiere_cita else "nuevo"
                datos_cita = extraer_datos_cita(msg.texto) if quiere_cita else {}
                await actualizar_cliente(
                    telefono=msg.telefono,
                    estado=estado,
                    servicio=datos_cita.get("servicio", ""),
                )

                # Si pidió cita y extrajimos datos, pre-registrar
                if quiere_cita and datos_cita.get("fecha"):
                    await registrar_cita(
                        telefono=msg.telefono,
                        nombre=datos_cita.get("nombre", ""),
                        servicio=datos_cita.get("servicio", ""),
                        fecha_preferida=datos_cita.get("fecha", ""),
                        notas=f"Auto-registrada del chat: '{msg.texto[:100]}'",
                    )
                    logger.info(f"Cita pre-registrada para {msg.telefono}")

            logger.info(f"Respuesta enviada a {msg.telefono}")

        except Exception as e:
            logger.exception(f"Error procesando mensaje de {msg.telefono}: {e}")
            await liberar_evento(evento_id)
            try:
                await proveedor.enviar_mensaje(msg.telefono, obtener_mensaje_error(), msg.contexto)
            except Exception:
                logger.error("No se pudo avisar al cliente del error")


# ── Endpoints de gestión interna ─────────────────────────────────────────────

def _verificar_api_key(request: Request) -> bool:
    if not REPORT_API_KEY:
        return True
    return request.headers.get("X-API-Key") == REPORT_API_KEY


@app.get("/admin/reporte")
async def reporte_semanal(request: Request):
    """Reporte semanal: citas pendientes, clientes en seguimiento, alertas."""
    if not _verificar_api_key(request):
        raise HTTPException(status_code=401, detail="API Key inválida")

    citas = await obtener_citas_pendientes()
    clientes = await obtener_clientes_para_seguimiento(dias_sin_contacto=7)
    alertas = await obtener_alertas_sin_revisar()

    return {
        "citas_pendientes": citas,
        "clientes_en_seguimiento": clientes,
        "alertas_potenciales": alertas,
        "resumen": {
            "total_citas": len(citas),
            "total_seguimiento": len(clientes),
            "total_alertas": len(alertas),
        },
    }


@app.get("/admin/reporte/texto")
async def reporte_semanal_texto(request: Request):
    """Versión de texto plano del reporte, fácil de copiar/enviar."""
    if not _verificar_api_key(request):
        raise HTTPException(status_code=401, detail="API Key inválida")

    citas = await obtener_citas_pendientes()
    clientes = await obtener_clientes_para_seguimiento(dias_sin_contacto=7)
    alertas = await obtener_alertas_sin_revisar()

    texto = generar_reporte_semanal_texto(citas, clientes, alertas)
    return PlainTextResponse(texto)


@app.get("/admin/alertas")
async def ver_alertas(request: Request):
    """Alertas de clientes y trabajos potenciales sin revisar."""
    if not _verificar_api_key(request):
        raise HTTPException(status_code=401, detail="API Key inválida")

    alertas = await obtener_alertas_sin_revisar()
    return {"alertas": alertas, "total": len(alertas)}


@app.get("/admin/citas")
async def ver_citas(request: Request):
    """Citas pendientes y confirmadas."""
    if not _verificar_api_key(request):
        raise HTTPException(status_code=401, detail="API Key inválida")

    citas = await obtener_citas_pendientes()
    return {"citas": citas, "total": len(citas)}
