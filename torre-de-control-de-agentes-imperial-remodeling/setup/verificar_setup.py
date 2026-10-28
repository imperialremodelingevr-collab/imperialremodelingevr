#!/usr/bin/env python3
"""Verifica que la instalación de la Torre de Control esté completa y sana.

Uso:  python3 setup/verificar_setup.py            (revisión local, sin red)
      python3 setup/verificar_setup.py --red      (también prueba api.telegram.org)
Sale con código 1 si hay alguna FALLA; las ADVERTENCIAS no cortan nada.
Nunca imprime valores de variables de entorno, solo si existen.
"""
import json
import os
import py_compile
import re
import socket
import sys
import tempfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(RAIZ)
OK, AVISO, FALLA = "OK   ", "AVISO", "FALLA"
resultados = []


def anota(nivel, texto):
    resultados.append((nivel, texto))
    print(f"[{nivel}] {texto}")


def existe(rel, obligatorio=True):
    ruta = os.path.join(RAIZ, rel)
    if os.path.exists(ruta):
        anota(OK, f"existe {rel}")
        return ruta
    anota(FALLA if obligatorio else AVISO, f"falta {rel}")
    return None


def revisa_archivos():
    for rel in ["index.html", "README.md", "PENDIENTES.md", "REGLAS.md", "SEGURIDAD.md", "SETUP.md",
                "base-de-datos/respaldo-db.json", "integraciones/reporte_telegram.py", "integraciones/telegram_bandeja.py",
                "integraciones/ejemplos_alertas.py", "integraciones/agente_oportunidades.py",
                "pruebas/func.js", "pruebas/func2.js", "pruebas/seguridad.js", "pruebas/voz.js", "pruebas/pisos.js"]:
        existe(rel)


def revisa_html():
    ruta = os.path.join(RAIZ, "index.html")
    if not os.path.exists(ruta):
        return
    h = open(ruta, encoding="utf-8").read()
    anota(OK if len(h) < 5_000_000 else FALLA, f"index.html pesa {len(h) // 1024} KB (límite del artifact: 16 MB)")
    anota(OK if h.rstrip().endswith(("</html>", "</script>")) else FALLA, "index.html termina bien (el artifact es un fragmento que termina en </script>)")
    a, c = len(re.findall(r"<script\b", h)), len(re.findall(r"</script>", h))
    anota(OK if a == c else FALLA, f"etiquetas script balanceadas ({a}/{c})")
    for patron, msg in [(r"\beval\s*\(", "usa eval()"), (r"document\.write\s*\(", "usa document.write()"), (r"new Function\s*\(", "usa new Function()")]:
        anota(FALLA if re.search(patron, h) else OK, "no " + msg)
    anota(OK if "three.js/r128/three.min.js" in h else FALLA, "three.js fijado en la versión r128")
    sin_sri = [m for m in re.findall(r"cdn\.jsdelivr\.net/npm/three@0\.128\.0/examples/js/", h)]
    anota(OK if sin_sri and "sha384-" in h else AVISO, "librerías de efectos con hash de integridad (SRI)")
    for clave in ["window.claude", "JCHAT", "sysChecks", "jarvisTools", "integrityIssues"]:
        anota(OK if clave in h else FALLA, f"contiene {clave}")


def revisa_secretos():
    patrones = {
        "token de Telegram": r"\b\d{8,10}:[A-Za-z0-9_-]{35}\b",
        "llave tipo sk-": r"\bsk-[A-Za-z0-9_-]{20,}",
        "llave de Google": r"\bAIza[0-9A-Za-z_-]{35}\b",
        "token de GitHub": r"\bgh[pousr]_[A-Za-z0-9]{36,}\b",
    }
    hallados = 0
    for base, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__")]
        for f in files:
            if not f.endswith((".md", ".py", ".js", ".html", ".json", ".yml", ".yaml", ".txt", ".sh")):
                continue
            try:
                t = open(os.path.join(base, f), encoding="utf-8", errors="ignore").read()
            except OSError:
                continue
            for nombre, p in patrones.items():
                if re.search(p, t):
                    hallados += 1
                    anota(FALLA, f"posible {nombre} en {os.path.relpath(os.path.join(base, f), REPO)} (bórralo y revócalo)")
    if not hallados:
        anota(OK, "no hay llaves ni tokens escritos en los archivos")


def revisa_python():
    d = os.path.join(RAIZ, "integraciones")
    if not os.path.isdir(d):
        return
    for f in sorted(os.listdir(d)):
        if f.endswith(".py"):
            try:
                py_compile.compile(os.path.join(d, f), cfile=os.path.join(tempfile.gettempdir(), f + "c"), doraise=True)
                anota(OK, f"compila integraciones/{f}")
            except py_compile.PyCompileError as e:
                anota(FALLA, f"integraciones/{f} no compila: {e.msg.strip()[:120]}")


def revisa_respaldo():
    ruta = os.path.join(RAIZ, "base-de-datos/respaldo-db.json")
    if not os.path.exists(ruta):
        return
    try:
        datos = json.load(open(ruta, encoding="utf-8"))
        n = sum(len(v) for v in datos.values() if isinstance(v, dict)) if isinstance(datos, dict) else 0
        anota(OK if n else AVISO, f"respaldo de la base es JSON válido ({n} documentos)")
    except ValueError as e:
        anota(FALLA, f"respaldo-db.json no es JSON válido: {e}")


def revisa_entorno(red):
    for v in ("TELEGRAM_TOKEN", "TELEGRAM_CHAT_ID"):
        anota(OK if os.environ.get(v) else AVISO, f"variable de entorno {v} " + ("definida" if os.environ.get(v) else "no definida (alertas al teléfono pendientes)"))
    if red:
        try:
            socket.create_connection(("api.telegram.org", 443), timeout=5).close()
            anota(OK, "se alcanza api.telegram.org")
        except OSError:
            anota(AVISO, "no se alcanza api.telegram.org (permítelo en la red del entorno)")


if __name__ == "__main__":
    print("== Verificación de la Torre de Control de Agentes ==")
    revisa_archivos()
    revisa_html()
    revisa_secretos()
    revisa_python()
    revisa_respaldo()
    revisa_entorno("--red" in sys.argv)
    f = sum(1 for n, _ in resultados if n == FALLA)
    a = sum(1 for n, _ in resultados if n == AVISO)
    print(f"\nResultado: {len(resultados) - f - a} bien, {a} avisos, {f} fallas")
    sys.exit(1 if f else 0)
