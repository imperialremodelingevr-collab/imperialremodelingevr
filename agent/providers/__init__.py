"""Elige el proveedor de WhatsApp según la variable WHATSAPP_PROVIDER del .env."""

import os

from agent.providers.base import MensajeEntrante, ProveedorWhatsApp

PROVEEDORES_SOPORTADOS = ("zernio", "meta")


def obtener_proveedor() -> ProveedorWhatsApp:
    proveedor = os.getenv("WHATSAPP_PROVIDER", "").strip().lower()

    if not proveedor:
        raise ValueError(
            "WHATSAPP_PROVIDER no está configurado en el .env. "
            f"Valores válidos: {' | '.join(PROVEEDORES_SOPORTADOS)}"
        )

    if proveedor == "zernio":
        from agent.providers.zernio import ProveedorZernio
        return ProveedorZernio()

    if proveedor == "meta":
        from agent.providers.meta import ProveedorMeta
        return ProveedorMeta()

    raise ValueError(
        f"Proveedor no soportado: '{proveedor}'. "
        f"Valores válidos: {' | '.join(PROVEEDORES_SOPORTADOS)}"
    )


__all__ = ["MensajeEntrante", "ProveedorWhatsApp", "PROVEEDORES_SOPORTADOS", "obtener_proveedor"]
