"""Ejemplos y pruebas de alertas de Nesty O Bot (Telegram).

  python3 ejemplos_alertas.py              # solo muestra los mensajes (no envía nada)
  python3 ejemplos_alertas.py --enviar     # los envía a tu Telegram (requiere TELEGRAM_TOKEN y TELEGRAM_CHAT_ID)
  python3 ejemplos_alertas.py --enviar 2   # envía solo el ejemplo número 2
"""
import json
import sys

EJEMPLOS = [
    {"id": "t01", "agente": "Facturación y cobros", "titulo": "🔴 FALLA: dejó de funcionar hace 15 min",
     "texto": "La conexión con QuickBooks venció. No puede enviar facturas ni recordatorios de pago.\n\n"
              "Qué hacer: vuelve a autorizar QuickBooks y reinicia el agente.",
     "botones": ["Corregir ahora", "Silenciar 1 h", "Ver torre"]},
    {"id": "t02", "agente": "Reseñas", "titulo": "🟡 ATENCIÓN: va lento",
     "texto": "Google responde lento. Hay 3 reseñas esperando respuesta. Reintentando conexión.",
     "botones": ["Reiniciar", "Ignorar"]},
    {"id": "t03", "agente": "Cotizaciones", "titulo": "❓ Necesito tu decisión",
     "texto": "Cotización de cocina: $18,450 con gabinetes a medida. El margen quedó en 14%, por debajo de tu mínimo de 20%.",
     "botones": ["Aprobar así", "Ajustar precio", "Rechazar"]},
    {"id": "t04", "agente": "Prospectos", "titulo": "🆕 Cliente nuevo",
     "texto": "Llegó una solicitud de remodelación de baño (código postal 33012). ¿Le envío hoy el formulario de visita?",
     "botones": ["Enviar formulario", "Mostrar borrador"]},
    {"id": "t05", "agente": "Facturación y cobros", "titulo": "✅ Resuelto",
     "texto": "QuickBooks volvió a conectarse y se enviaron 4 recordatorios de pago pendientes. Todo normal.",
     "botones": ["Entendido"]},
]


def formato(e):
    return f"*{e['agente']}* — {e['titulo']}\n\n{e['texto']}\n\nBotones: " + " | ".join(e["botones"])


if __name__ == "__main__":
    enviar = "--enviar" in sys.argv
    nums = [int(a) for a in sys.argv[1:] if a.isdigit()]
    lista = [EJEMPLOS[n - 1] for n in nums] if nums else EJEMPLOS
    if enviar:
        from telegram_bandeja import enviar as tg_enviar
        for e in lista:
            print(json.dumps(tg_enviar(e), ensure_ascii=False))
    else:
        for i, e in enumerate(lista, 1):
            print(f"--- Ejemplo {i} ---\n{formato(e)}\n")
