"""Envía el reporte diario de la Torre EVR por Telegram.

Uso:
  export TELEGRAM_TOKEN="token-de-tu-bot"   # se crea con @BotFather
  export TELEGRAM_CHAT_ID="tu-chat-id"
  python3 reporte_telegram.py "texto del reporte"   # o sin argumento para el ejemplo

El token NO va escrito en el archivo: se lee del entorno para no subirlo al repositorio.
"""
import os
import sys

import requests

EJEMPLO = """🤖 *Reporte Diario - Agente Abraham (CEO)*

📊 *Estado Actual:*
- Oportunidades revisadas: 12
- Proyectos sin retraso: 10
- ⚠️ *Atención requerida:* Cliente "Panamerican" requiere seguimiento.
"""


def enviar_reporte_diario(mensaje: str) -> dict:
    token = os.environ["TELEGRAM_TOKEN"]
    chat_id = os.environ["TELEGRAM_CHAT_ID"]
    r = requests.post(
        f"https://api.telegram.org/bot{token}/sendMessage",
        json={"chat_id": chat_id, "text": mensaje, "parse_mode": "Markdown"},
        timeout=20,
    )
    r.raise_for_status()
    return r.json()


if __name__ == "__main__":
    print(enviar_reporte_diario(sys.argv[1] if len(sys.argv) > 1 else EJEMPLO))
