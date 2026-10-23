"""Canal de dos vías Torre de Control <-> Telegram.

Variables de entorno (nunca escribas el token en el archivo ni en el chat):
  TELEGRAM_TOKEN     token del bot (@BotFather)
  TELEGRAM_CHAT_ID   tu chat; solo se aceptan respuestas de este chat

Comandos:
  enviar  '<json>'   envía un aviso con botones. JSON:
                     {"id":"i01","agente":"Cotizaciones","titulo":"Margen bajo","texto":"...",
                      "botones":["Aprobar","Corregir","Rechazar"]}
  recibir [--offset-file ruta]
                     lee tus respuestas nuevas y las imprime como JSON, una lista:
                     [{"id":"i01","accion":"Aprobar"} | {"id":"i01","accion":"texto","texto":"..."}]
  probar             comprueba que el token y el chat funcionan

Una respuesta con botón trae el id del aviso. Un texto libre responde al último aviso
(o a un aviso concreto si usas "Responder" sobre su mensaje en Telegram).
"""
import json
import os
import sys

import requests

API = "https://api.telegram.org/bot{token}/{method}"


def _cfg():
    return os.environ["TELEGRAM_TOKEN"], str(os.environ["TELEGRAM_CHAT_ID"])


def _call(method, **payload):
    token, _ = _cfg()
    r = requests.post(API.format(token=token, method=method), json=payload, timeout=25)
    r.raise_for_status()
    data = r.json()
    if not data.get("ok"):
        raise RuntimeError(data)
    return data["result"]


def enviar(aviso: dict):
    _, chat = _cfg()
    texto = f"*{aviso.get('agente', 'Agente')}* — {aviso.get('titulo', '')}\n\n{aviso.get('texto', '')}"
    botones = aviso.get("botones") or ["Aprobar", "Corregir", "Rechazar"]
    teclado = [[{"text": b, "callback_data": f"{aviso['id']}|{b}"[:64]} for b in botones]]
    msg = _call("sendMessage", chat_id=chat, text=texto, parse_mode="Markdown",
                reply_markup={"inline_keyboard": teclado})
    return {"message_id": msg["message_id"], "id": aviso["id"]}


def interpretar(updates, chat_id, avisos_por_mensaje=None, ultimo_id=None):
    """Convierte updates de Telegram en decisiones. Ignora a cualquier otra persona."""
    salida = []
    for u in updates:
        cb = u.get("callback_query")
        if cb:
            if str(cb["message"]["chat"]["id"]) != chat_id:
                continue
            aviso_id, _, accion = cb["data"].partition("|")
            salida.append({"id": aviso_id, "accion": accion, "update": u["update_id"], "callback": cb["id"]})
            ultimo_id = aviso_id
            continue
        m = u.get("message")
        if not m or str(m["chat"]["id"]) != chat_id or not m.get("text"):
            continue
        aviso_id = ultimo_id
        resp = m.get("reply_to_message")
        if resp and avisos_por_mensaje:
            aviso_id = avisos_por_mensaje.get(resp["message_id"], aviso_id)
        salida.append({"id": aviso_id, "accion": "texto", "texto": m["text"], "update": u["update_id"]})
    return salida


def recibir(offset_file="telegram_offset.txt"):
    _, chat = _cfg()
    offset = int(open(offset_file).read()) if os.path.exists(offset_file) else 0
    updates = _call("getUpdates", offset=offset, timeout=0, allowed_updates=["message", "callback_query"])
    decisiones = interpretar(updates, chat)
    for d in decisiones:
        if d.get("callback"):
            try:
                _call("answerCallbackQuery", callback_query_id=d["callback"], text="Recibido ✅")
            except Exception:
                pass
    if updates:
        open(offset_file, "w").write(str(updates[-1]["update_id"] + 1))
    return decisiones


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "probar"
    if cmd == "enviar":
        print(json.dumps(enviar(json.loads(sys.argv[2])), ensure_ascii=False))
    elif cmd == "recibir":
        of = sys.argv[sys.argv.index("--offset-file") + 1] if "--offset-file" in sys.argv else "telegram_offset.txt"
        print(json.dumps(recibir(of), ensure_ascii=False))
    else:
        print(json.dumps(_call("getMe"), ensure_ascii=False))
