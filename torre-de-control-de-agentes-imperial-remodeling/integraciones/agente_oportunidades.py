#!/usr/bin/env python3
"""Agente «Oportunidades» (piso 12 de la torre): busca casas para remodelar en McKinney, Plano y Frisco.

RUTA SIN LLAVES (la que ya está activa): una tarea programada de Claude Code («Oportunidades: casas para
remodelar (DFW)», lunes a sábado 11:23 hora de Chicago) busca con WebSearch/WebFetch, y deja cada propiedad
como propuesta en la bandeja de la torre (inbox/op01…). No necesita ninguna llave. Este archivo es solo la
alternativa si algún día quieres un navegador robot propio.

Basado en el ejemplo de browser-use que pasó Ernesto. Cambios importantes frente al original:
  * Ningún token ni llave dentro del archivo: todo sale de variables de entorno.
  * Solo LEE y propone. Guarda `oportunidades.json`; nada se envía ni se compra sin tu «sí».
  * Modelo configurable (por defecto Claude; puede usarse OpenAI cambiando LLM_PROVIDER).
  * Revisa los términos de uso de cada portal antes de automatizarlo. Si un portal los prohíbe,
    usa su feed/API oficial o un servicio de datos con licencia en lugar de navegar con un robot.

NO se ha ejecutado desde la torre (necesita llaves y red externa). Instalación aparte:
    pip install browser-use langchain-anthropic        # o langchain-openai
Variables: ANTHROPIC_API_KEY (u OPENAI_API_KEY), opcional BROWSER_CDP_URL (navegador en la nube).
Nota: browser-use cambia de API entre versiones; si `BrowserConfig` no existe, consulta su documentación.
"""
import asyncio
import json
import os
import sys
from datetime import datetime, timezone

TAREA = """
1. Abre portales públicos de bienes raíces de McKinney, Plano y Frisco (Texas).
2. Busca casas que necesiten remodelación integral (fixer-upper).
3. Para cada una extrae: dirección, precio de lista, pies cuadrados, año de construcción y el enlace.
4. Responde SOLO con una lista JSON de objetos con esas llaves. No inventes datos: si falta uno, pon null.
"""


def crear_llm():
    if os.getenv("LLM_PROVIDER", "anthropic") == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(model=os.getenv("LLM_MODEL", "gpt-4o"), temperature=0.0)
    from langchain_anthropic import ChatAnthropic
    return ChatAnthropic(model=os.getenv("LLM_MODEL", "claude-sonnet-5-5"), temperature=0.0)


async def correr():
    from browser_use import Agent, Browser, BrowserConfig  # import tardío: dependencia opcional

    cdp = os.getenv("BROWSER_CDP_URL")  # p. ej. wss://...; sin esta variable se usa un navegador local
    browser = Browser(config=BrowserConfig(headless=True, cdp_url=cdp) if cdp else BrowserConfig(headless=True))
    agente = Agent(task=TAREA, llm=crear_llm(), browser=browser)
    historial = await agente.run()
    texto = historial.final_result() if hasattr(historial, "final_result") else str(historial)
    try:
        datos = json.loads(texto)
    except (TypeError, ValueError):
        datos = {"sin_formato": texto}
    salida = {"generado": datetime.now(timezone.utc).isoformat(), "estado": "propuesta, requiere aprobación", "propiedades": datos}
    with open("oportunidades.json", "w", encoding="utf-8") as f:
        json.dump(salida, f, ensure_ascii=False, indent=2)
    print("Listo: oportunidades.json (revísalo antes de usarlo).")


if __name__ == "__main__":
    if not (os.getenv("ANTHROPIC_API_KEY") or os.getenv("OPENAI_API_KEY")):
        sys.exit("Falta ANTHROPIC_API_KEY u OPENAI_API_KEY en el entorno.")
    asyncio.run(correr())
