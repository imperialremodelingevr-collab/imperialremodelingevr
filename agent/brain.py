"""Cerebro del agente: conexión con Claude AI."""

import logging
import os

import yaml
from anthropic import AsyncAnthropic
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("agentkit")

client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

MODELO = os.getenv("ANTHROPIC_MODEL") or "claude-sonnet-5-5"
ESFUERZO = os.getenv("ANTHROPIC_EFFORT", "low").strip()
MAX_TOKENS = int(os.getenv("ANTHROPIC_MAX_TOKENS") or "4096")

_soporta_esfuerzo = True


def cargar_config_prompts() -> dict:
    try:
        with open("config/prompts.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("config/prompts.yaml no encontrado")
        return {}


def cargar_system_prompt() -> str:
    return cargar_config_prompts().get(
        "system_prompt", "Eres Sofia, asistente de Imperial Remodeling EVR. Responde siempre en español."
    )


def obtener_mensaje_error() -> str:
    return cargar_config_prompts().get(
        "error_message",
        "Lo siento, estoy teniendo problemas técnicos. Por favor intenta de nuevo en unos minutos.",
    )


def obtener_mensaje_fallback() -> str:
    return cargar_config_prompts().get(
        "fallback_message",
        "Disculpa, no entendí bien. ¿Podrías contarme más sobre lo que necesitas?",
    )


def _extraer_texto(respuesta) -> str:
    partes = [bloque.text for bloque in respuesta.content if bloque.type == "text"]
    return "\n".join(p for p in partes if p).strip()


def _es_error_de_esfuerzo(error: Exception) -> bool:
    if getattr(error, "status_code", None) != 400:
        return False
    texto = str(error).lower()
    return "output_config" in texto or "effort" in texto


async def generar_respuesta(mensaje: str, historial: list[dict]) -> tuple[str, bool]:
    global _soporta_esfuerzo

    if not mensaje or len(mensaje.strip()) < 2:
        return obtener_mensaje_fallback(), False

    mensajes = [{"role": m["role"], "content": m["content"]} for m in historial]
    mensajes.append({"role": "user", "content": mensaje})

    system_prompt = cargar_system_prompt()
    extras = {"output_config": {"effort": ESFUERZO}} if (_soporta_esfuerzo and ESFUERZO) else {}

    async def _llamar(params_extra: dict):
        return await client.messages.create(
            model=MODELO,
            max_tokens=MAX_TOKENS,
            system=system_prompt,
            messages=mensajes,
            **params_extra,
        )

    try:
        respuesta = await _llamar(extras)
    except Exception as e:
        if extras and _es_error_de_esfuerzo(e):
            logger.warning(f"Modelo {MODELO} no acepta output_config.effort; reintentando sin él.")
            _soporta_esfuerzo = False
            try:
                respuesta = await _llamar({})
            except Exception as e2:
                logger.error(f"Error llamando a Claude: {e2}")
                return obtener_mensaje_error(), False
        else:
            logger.error(f"Error llamando a Claude: {e}")
            return obtener_mensaje_error(), False

    if getattr(respuesta, "stop_reason", None) == "max_tokens":
        logger.warning(f"Respuesta cortada por límite de {MAX_TOKENS} tokens.")

    texto = _extraer_texto(respuesta)
    if not texto:
        logger.warning("Claude devolvió respuesta sin texto")
        return obtener_mensaje_fallback(), False

    logger.info(f"Respuesta con {MODELO} ({respuesta.usage.input_tokens} in / {respuesta.usage.output_tokens} out)")
    return texto, True
