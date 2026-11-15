"""
Herramientas de negocio para Imperial Remodeling EVR.
Citas, seguimiento de clientes, alertas de trabajos potenciales.
"""

import logging
import re
from datetime import datetime, timezone
from pathlib import Path

import yaml

logger = logging.getLogger("agentkit")
CARPETA_KNOWLEDGE = Path("knowledge")

# ── Señales de trabajo potencial caliente ────────────────────────────────────
SENALES_CALIENTES = [
    "varios cuartos", "toda la casa", "proyecto grande", "urgente", "esta semana",
    "esta semana", "referido", "me recomendaron", "negocio", "restaurante", "oficina",
    "cuanto cobran", "presupuesto", "varios baños", "toda la cocina",
    "need it done", "asap", "big project", "commercial", "referral",
]


def cargar_info_negocio() -> dict:
    try:
        with open("config/business.yaml", "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    except FileNotFoundError:
        logger.error("config/business.yaml no encontrado")
        return {}


def obtener_horario() -> dict:
    info = cargar_info_negocio()
    return {
        "horario": info.get("negocio", {}).get("horario", "Lunes-Viernes 8am-6pm, Sábados 9am-3pm PT"),
        "zona": "Pacific Time (Las Vegas, NV)",
    }


def buscar_en_knowledge(consulta: str) -> str:
    if not CARPETA_KNOWLEDGE.is_dir():
        return "No hay archivos de conocimiento disponibles."

    resultados = []
    for ruta in sorted(CARPETA_KNOWLEDGE.iterdir()):
        if ruta.name.startswith(".") or not ruta.is_file():
            continue
        try:
            contenido = ruta.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        if consulta.lower() in contenido.lower():
            resultados.append(f"[{ruta.name}]: {contenido[:600]}")

    return "\n---\n".join(resultados) if resultados else "No encontré información específica sobre eso."


def detectar_lead_caliente(texto: str) -> tuple[bool, str]:
    """
    Analiza el texto de un mensaje y determina si es un lead caliente.
    Retorna (es_caliente, razon).
    """
    texto_lower = texto.lower()
    razones = [s for s in SENALES_CALIENTES if s in texto_lower]
    return bool(razones), ", ".join(razones[:3]) if razones else ""


def extraer_datos_cita(texto: str) -> dict:
    """
    Intenta extraer nombre, servicio y fecha de un mensaje de texto.
    Retorna un dict con los campos encontrados (pueden estar vacíos).
    """
    datos = {"nombre": "", "servicio": "", "fecha": ""}

    servicios_posibles = [
        "cocina", "kitchen", "baño", "bathroom", "piso", "floor", "pintura", "paint",
        "exterior", "comercial", "commercial", "remodelación completa", "full remodel",
    ]
    for s in servicios_posibles:
        if s in texto.lower():
            datos["servicio"] = s
            break

    # Patrones de fecha simples
    patrones_fecha = [
        r"\b(lunes|martes|miércoles|jueves|viernes|sábado|domingo)\b",
        r"\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b",
        r"\b\d{1,2}/\d{1,2}\b",
        r"\b(esta semana|next week|la próxima semana|mañana|tomorrow)\b",
    ]
    for patron in patrones_fecha:
        match = re.search(patron, texto.lower())
        if match:
            datos["fecha"] = match.group(0)
            break

    return datos


def generar_reporte_semanal_texto(citas: list[dict], clientes_seguimiento: list[dict], alertas: list[dict]) -> str:
    """Genera el texto del reporte semanal para el equipo."""
    hoy = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lineas = [
        f"📋 REPORTE SEMANAL — Imperial Remodeling EVR",
        f"Fecha: {hoy}",
        "",
    ]

    lineas.append(f"🗓️ CITAS PENDIENTES ({len(citas)})")
    if citas:
        for c in citas:
            lineas.append(f"  • {c['nombre']} | {c['servicio']} | {c['fecha']} | Estado: {c['estado']}")
    else:
        lineas.append("  — Sin citas pendientes")

    lineas.append("")
    lineas.append(f"🔄 CLIENTES EN SEGUIMIENTO ({len(clientes_seguimiento)})")
    if clientes_seguimiento:
        for cl in clientes_seguimiento:
            lineas.append(f"  • {cl['nombre'] or cl['telefono']} | {cl['estado']} | {cl['servicio']} | Última vez: {cl['ultima_interaccion'][:10]}")
    else:
        lineas.append("  — Todos los clientes están al día")

    lineas.append("")
    lineas.append(f"🚨 ALERTAS DE TRABAJOS POTENCIALES ({len(alertas)})")
    if alertas:
        for a in alertas:
            lineas.append(f"  • [{a['nivel'].upper()}] {a['nombre'] or a['telefono']} | {a['servicio']} | {a['descripcion'][:80]}")
    else:
        lineas.append("  — Sin alertas nuevas")

    return "\n".join(lineas)
