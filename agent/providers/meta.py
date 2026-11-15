"""Adaptador para Meta WhatsApp Cloud API. Docs: https://developers.facebook.com/docs/whatsapp/cloud-api"""

import hashlib
import hmac
import logging
import os

import httpx
from fastapi import Request

from agent.providers.base import MensajeEntrante, ProveedorWhatsApp

logger = logging.getLogger("agentkit")


class ProveedorMeta(ProveedorWhatsApp):

    def __init__(self):
        self.access_token = os.getenv("META_ACCESS_TOKEN", "")
        self.phone_number_id = os.getenv("META_PHONE_NUMBER_ID", "")
        self.verify_token = os.getenv("META_VERIFY_TOKEN") or "agentkit-verify"
        self.app_secret = os.getenv("META_APP_SECRET", "")
        self.api_version = os.getenv("META_API_VERSION") or "v25.0"

        if not self.access_token or not self.phone_number_id:
            logger.warning("Faltan META_ACCESS_TOKEN o META_PHONE_NUMBER_ID")
        if not self.app_secret:
            logger.warning("META_APP_SECRET no configurado: webhooks SIN verificar (solo para pruebas)")

    async def validar_webhook(self, request: Request) -> str | None:
        params = request.query_params
        if params.get("hub.mode") == "subscribe" and params.get("hub.verify_token") == self.verify_token:
            return params.get("hub.challenge") or ""
        return None

    async def verificar_firma(self, request: Request) -> bool:
        if not self.app_secret:
            return True

        cabecera = request.headers.get("X-Hub-Signature-256", "")
        if not cabecera.startswith("sha256="):
            return False

        cuerpo = await request.body()
        firma_esperada = hmac.new(self.app_secret.encode("utf-8"), cuerpo, hashlib.sha256).hexdigest()

        try:
            return hmac.compare_digest(firma_esperada, cabecera.removeprefix("sha256="))
        except TypeError:
            return False

    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]:
        body = await request.json()
        mensajes = []
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                value = change.get("value") or {}
                for msg in value.get("messages", []):
                    if msg.get("type") != "text":
                        continue
                    mensajes.append(MensajeEntrante(
                        telefono=msg.get("from", ""),
                        texto=(msg.get("text") or {}).get("body", ""),
                        mensaje_id=msg.get("id", ""),
                        es_propio=False,
                        contexto={"evento_id": msg.get("id", "")},
                    ))
        return mensajes

    async def enviar_mensaje(self, telefono: str, mensaje: str, contexto: dict | None = None) -> bool:
        if not self.access_token or not self.phone_number_id:
            logger.error("Faltan META_ACCESS_TOKEN o META_PHONE_NUMBER_ID")
            return False

        url = f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}/messages"

        try:
            async with httpx.AsyncClient(timeout=30.0) as cliente:
                r = await cliente.post(
                    url,
                    json={"messaging_product": "whatsapp", "to": telefono, "type": "text", "text": {"body": mensaje}},
                    headers={"Authorization": f"Bearer {self.access_token}", "Content-Type": "application/json"},
                )
        except httpx.HTTPError as e:
            logger.error(f"Error de red con Meta: {e}")
            return False

        if r.status_code == 200:
            return True
        logger.error(f"Meta rechazó el envío [{r.status_code}]: {r.text[:300]}")
        return False

    async def verificar_conexion(self) -> tuple[bool, str]:
        if not self.access_token or not self.phone_number_id:
            return False, "Faltan META_ACCESS_TOKEN o META_PHONE_NUMBER_ID"

        try:
            async with httpx.AsyncClient(timeout=15.0) as cliente:
                r = await cliente.get(
                    f"https://graph.facebook.com/{self.api_version}/{self.phone_number_id}",
                    params={"fields": "display_phone_number,verified_name,quality_rating"},
                    headers={"Authorization": f"Bearer {self.access_token}"},
                )
        except httpx.HTTPError as e:
            return False, f"No se pudo contactar a Meta: {e}"

        if r.status_code != 200:
            return False, f"Meta respondió {r.status_code}: {r.text[:200]}"

        datos = r.json()
        return True, f"Número {datos.get('display_phone_number', '?')} conectado (calidad: {datos.get('quality_rating', '?')})"
