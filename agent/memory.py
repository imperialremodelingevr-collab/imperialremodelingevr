"""
Memoria del agente: conversaciones, citas programadas, estado de clientes y alertas.
SQLite en local, PostgreSQL en producción.
"""

import logging
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from sqlalchemy import DateTime, Integer, String, Text, delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

load_dotenv()
logger = logging.getLogger("agentkit")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./agentkit.db")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)

if DATABASE_URL.startswith("sqlite") and os.getenv("ENVIRONMENT") == "production":
    logger.warning(
        "Estás en producción con SQLite. El historial se borrará en cada redespliegue. "
        "Configura DATABASE_URL con PostgreSQL para persistencia real."
    )

engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    pass


# ── Historial de conversaciones ──────────────────────────────────────────────

class Mensaje(Base):
    __tablename__ = "mensajes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telefono: Mapped[str] = mapped_column(String(50), index=True)
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)


class EventoProcesado(Base):
    __tablename__ = "eventos_procesados"

    evento_id: Mapped[str] = mapped_column(String(200), primary_key=True)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora, index=True)


# ── Citas programadas ────────────────────────────────────────────────────────

class Cita(Base):
    """Cita de estimación o visita programada con un cliente."""
    __tablename__ = "citas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telefono: Mapped[str] = mapped_column(String(50), index=True)
    nombre_cliente: Mapped[str] = mapped_column(String(200), default="")
    servicio: Mapped[str] = mapped_column(String(200), default="")
    fecha_preferida: Mapped[str] = mapped_column(String(100), default="")
    estado: Mapped[str] = mapped_column(String(50), default="pendiente")
    # pendiente | confirmada | completada | cancelada
    notas: Mapped[str] = mapped_column(Text, default="")
    recordatorio_enviado: Mapped[int] = mapped_column(Integer, default=0)
    creada_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)
    actualizada_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)


# ── Estado y seguimiento de clientes ────────────────────────────────────────

class ClienteStatus(Base):
    """Estado de seguimiento de cada cliente por teléfono."""
    __tablename__ = "clientes_status"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telefono: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    nombre: Mapped[str] = mapped_column(String(200), default="")
    estado: Mapped[str] = mapped_column(String(50), default="nuevo")
    # nuevo | prospecto | cotizado | trabajo_programado | en_progreso | completado | perdido
    servicio_interes: Mapped[str] = mapped_column(String(200), default="")
    notas: Mapped[str] = mapped_column(Text, default="")
    ultima_interaccion: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)
    creado_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)


# ── Alertas de trabajos potenciales ─────────────────────────────────────────

class AlertaPotencial(Base):
    """Alerta de cliente o trabajo con alto potencial."""
    __tablename__ = "alertas_potenciales"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    telefono: Mapped[str] = mapped_column(String(50), index=True)
    nombre_cliente: Mapped[str] = mapped_column(String(200), default="")
    servicio: Mapped[str] = mapped_column(String(200), default="")
    descripcion: Mapped[str] = mapped_column(Text, default="")
    nivel: Mapped[str] = mapped_column(String(20), default="normal")
    # normal | caliente | urgente
    revisada: Mapped[int] = mapped_column(Integer, default=0)
    creada_en: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=ahora)


# ── Inicialización ───────────────────────────────────────────────────────────

async def inicializar_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ── Deduplicación de eventos ─────────────────────────────────────────────────

async def marcar_evento_procesado(evento_id: str) -> bool:
    if not evento_id:
        return True
    async with async_session() as session:
        session.add(EventoProcesado(evento_id=evento_id, creado_en=ahora()))
        try:
            await session.commit()
            return True
        except IntegrityError:
            await session.rollback()
            return False


async def liberar_evento(evento_id: str):
    if not evento_id:
        return
    async with async_session() as session:
        await session.execute(delete(EventoProcesado).where(EventoProcesado.evento_id == evento_id))
        await session.commit()


async def limpiar_eventos_viejos(dias: int = 7):
    limite = ahora() - timedelta(days=dias)
    async with async_session() as session:
        resultado = await session.execute(
            delete(EventoProcesado).where(EventoProcesado.creado_en < limite)
        )
        await session.commit()
    if resultado.rowcount:
        logger.info(f"Se limpiaron {resultado.rowcount} eventos de más de {dias} días")


# ── Historial de conversación ────────────────────────────────────────────────

async def guardar_mensaje(telefono: str, role: str, content: str):
    async with async_session() as session:
        session.add(Mensaje(telefono=telefono, role=role, content=content, timestamp=ahora()))
        await session.commit()


async def obtener_historial(telefono: str, limite: int = 20) -> list[dict]:
    async with async_session() as session:
        resultado = await session.execute(
            select(Mensaje).where(Mensaje.telefono == telefono).order_by(Mensaje.id.desc()).limit(limite)
        )
        mensajes = list(resultado.scalars().all())

    mensajes.reverse()
    while mensajes and mensajes[0].role != "user":
        mensajes.pop(0)
    return [{"role": m.role, "content": m.content} for m in mensajes]


async def limpiar_historial(telefono: str):
    async with async_session() as session:
        await session.execute(delete(Mensaje).where(Mensaje.telefono == telefono))
        await session.commit()


# ── Citas ────────────────────────────────────────────────────────────────────

async def registrar_cita(telefono: str, nombre: str, servicio: str, fecha_preferida: str, notas: str = "") -> int:
    """Crea una nueva cita y retorna su id."""
    async with async_session() as session:
        cita = Cita(
            telefono=telefono, nombre_cliente=nombre, servicio=servicio,
            fecha_preferida=fecha_preferida, notas=notas,
            creada_en=ahora(), actualizada_en=ahora(),
        )
        session.add(cita)
        await session.commit()
        await session.refresh(cita)
        return cita.id


async def obtener_citas_pendientes() -> list[dict]:
    """Retorna todas las citas pendientes o confirmadas."""
    async with async_session() as session:
        resultado = await session.execute(
            select(Cita)
            .where(Cita.estado.in_(["pendiente", "confirmada"]))
            .order_by(Cita.creada_en.asc())
        )
        citas = resultado.scalars().all()
    return [
        {"id": c.id, "telefono": c.telefono, "nombre": c.nombre_cliente,
         "servicio": c.servicio, "fecha": c.fecha_preferida, "estado": c.estado,
         "notas": c.notas, "recordatorio_enviado": c.recordatorio_enviado}
        for c in citas
    ]


async def actualizar_estado_cita(cita_id: int, estado: str):
    async with async_session() as session:
        resultado = await session.execute(select(Cita).where(Cita.id == cita_id))
        cita = resultado.scalar_one_or_none()
        if cita:
            cita.estado = estado
            cita.actualizada_en = ahora()
            await session.commit()


async def marcar_recordatorio_enviado(cita_id: int):
    async with async_session() as session:
        resultado = await session.execute(select(Cita).where(Cita.id == cita_id))
        cita = resultado.scalar_one_or_none()
        if cita:
            cita.recordatorio_enviado = 1
            await session.commit()


# ── Clientes / seguimiento ───────────────────────────────────────────────────

async def actualizar_cliente(telefono: str, nombre: str = "", estado: str = "", servicio: str = "", notas: str = ""):
    """Crea o actualiza el perfil de seguimiento de un cliente."""
    async with async_session() as session:
        resultado = await session.execute(select(ClienteStatus).where(ClienteStatus.telefono == telefono))
        cliente = resultado.scalar_one_or_none()

        if cliente:
            if nombre:
                cliente.nombre = nombre
            if estado:
                cliente.estado = estado
            if servicio:
                cliente.servicio_interes = servicio
            if notas:
                cliente.notas = notas
            cliente.ultima_interaccion = ahora()
        else:
            cliente = ClienteStatus(
                telefono=telefono, nombre=nombre or "", estado=estado or "nuevo",
                servicio_interes=servicio or "", notas=notas or "",
                ultima_interaccion=ahora(), creado_en=ahora(),
            )
            session.add(cliente)
        await session.commit()


async def obtener_clientes_para_seguimiento(dias_sin_contacto: int = 7) -> list[dict]:
    """Clientes que no han tenido interacción en N días y no están completados/perdidos."""
    limite = ahora() - timedelta(days=dias_sin_contacto)
    async with async_session() as session:
        resultado = await session.execute(
            select(ClienteStatus)
            .where(
                ClienteStatus.ultima_interaccion < limite,
                ClienteStatus.estado.notin_(["completado", "perdido"]),
            )
            .order_by(ClienteStatus.ultima_interaccion.asc())
        )
        clientes = resultado.scalars().all()
    return [
        {"telefono": c.telefono, "nombre": c.nombre, "estado": c.estado,
         "servicio": c.servicio_interes, "ultima_interaccion": c.ultima_interaccion.isoformat(),
         "notas": c.notas}
        for c in clientes
    ]


# ── Alertas de trabajos potenciales ─────────────────────────────────────────

async def crear_alerta(telefono: str, nombre: str, servicio: str, descripcion: str, nivel: str = "normal"):
    async with async_session() as session:
        alerta = AlertaPotencial(
            telefono=telefono, nombre_cliente=nombre, servicio=servicio,
            descripcion=descripcion, nivel=nivel, creada_en=ahora(),
        )
        session.add(alerta)
        await session.commit()


async def obtener_alertas_sin_revisar() -> list[dict]:
    async with async_session() as session:
        resultado = await session.execute(
            select(AlertaPotencial)
            .where(AlertaPotencial.revisada == 0)
            .order_by(AlertaPotencial.nivel.desc(), AlertaPotencial.creada_en.desc())
        )
        alertas = resultado.scalars().all()
    return [
        {"id": a.id, "telefono": a.telefono, "nombre": a.nombre_cliente,
         "servicio": a.servicio, "descripcion": a.descripcion,
         "nivel": a.nivel, "fecha": a.creada_en.isoformat()}
        for a in alertas
    ]


async def marcar_alerta_revisada(alerta_id: int):
    async with async_session() as session:
        resultado = await session.execute(select(AlertaPotencial).where(AlertaPotencial.id == alerta_id))
        alerta = resultado.scalar_one_or_none()
        if alerta:
            alerta.revisada = 1
            await session.commit()
