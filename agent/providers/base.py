"""Define la interfaz común que todos los proveedores de WhatsApp implementan."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field

from fastapi import Request


@dataclass
class MensajeEntrante:
    """Mensaje normalizado: el mismo formato sin importar el proveedor."""

    telefono: str
    texto: str
    mensaje_id: str
    es_propio: bool
    contexto: dict = field(default_factory=dict)


class ProveedorWhatsApp(ABC):
    @abstractmethod
    async def parsear_webhook(self, request: Request) -> list[MensajeEntrante]: ...

    @abstractmethod
    async def enviar_mensaje(self, telefono: str, mensaje: str, contexto: dict | None = None) -> bool: ...

    async def verificar_firma(self, request: Request) -> bool:
        return True

    async def validar_webhook(self, request: Request) -> str | None:
        return None

    async def verificar_conexion(self) -> tuple[bool, str]:
        return True, "Este proveedor no expone un chequeo de conexión"
