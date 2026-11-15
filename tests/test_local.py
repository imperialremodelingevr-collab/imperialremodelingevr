"""
Simulador de chat en terminal — Imperial Remodeling EVR
Prueba el agente Sofia sin necesitar WhatsApp.

Uso: python tests/test_local.py
"""

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from agent.brain import generar_respuesta
from agent.memory import (
    guardar_mensaje,
    inicializar_db,
    limpiar_historial,
    obtener_alertas_sin_revisar,
    obtener_citas_pendientes,
    obtener_clientes_para_seguimiento,
    obtener_historial,
)
from agent.tools import detectar_lead_caliente, generar_reporte_semanal_texto

TELEFONO_TEST = "test-local-001"


async def main():
    await inicializar_db()

    print()
    print("=" * 60)
    print("   Imperial Remodeling EVR — Agente Sofia (Test Local)")
    print("=" * 60)
    print()
    print("  Escribe mensajes como si fueras un cliente de WhatsApp.")
    print("  Comandos especiales:")
    print("    'limpiar'   — borra el historial")
    print("    'reporte'   — muestra el reporte semanal")
    print("    'alertas'   — muestra alertas de trabajos potenciales")
    print("    'citas'     — muestra citas pendientes")
    print("    'salir'     — termina el test")
    print()
    print("-" * 60)
    print()

    while True:
        try:
            mensaje = input("Cliente: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n\nTest finalizado.")
            break

        if not mensaje:
            continue

        if mensaje.lower() == "salir":
            print("\nTest finalizado.")
            break

        if mensaje.lower() == "limpiar":
            await limpiar_historial(TELEFONO_TEST)
            print("[Historial borrado]\n")
            continue

        if mensaje.lower() == "reporte":
            citas = await obtener_citas_pendientes()
            clientes = await obtener_clientes_para_seguimiento()
            alertas = await obtener_alertas_sin_revisar()
            print("\n" + generar_reporte_semanal_texto(citas, clientes, alertas) + "\n")
            continue

        if mensaje.lower() == "alertas":
            alertas = await obtener_alertas_sin_revisar()
            print(f"\n🚨 Alertas sin revisar: {len(alertas)}")
            for a in alertas:
                print(f"  [{a['nivel'].upper()}] {a['nombre'] or a['telefono']} — {a['descripcion'][:80]}")
            print()
            continue

        if mensaje.lower() == "citas":
            citas = await obtener_citas_pendientes()
            print(f"\n🗓️ Citas pendientes: {len(citas)}")
            for c in citas:
                print(f"  • {c['nombre'] or c['telefono']} | {c['servicio']} | {c['fecha']} | {c['estado']}")
            print()
            continue

        # Chequeo de lead caliente
        es_caliente, razon = detectar_lead_caliente(mensaje)
        if es_caliente:
            print(f"  [🚨 Lead caliente detectado: {razon}]")

        historial = await obtener_historial(TELEFONO_TEST)
        print("\nSofia: ", end="", flush=True)
        respuesta, es_respuesta_real = await generar_respuesta(mensaje, historial)
        print(respuesta)
        print()

        if es_respuesta_real:
            await guardar_mensaje(TELEFONO_TEST, "user", mensaje)
            await guardar_mensaje(TELEFONO_TEST, "assistant", respuesta)


if __name__ == "__main__":
    asyncio.run(main())
