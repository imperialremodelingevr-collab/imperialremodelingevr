---
name: buscador-casas-flip
description: Busca casas off-market y con descuento para flipping en Plano, Frisco y McKinney (Texas), las analiza con la regla del 70% y las guarda en el tablero "Casas para Flip Collin". Usar cuando el usuario diga "busca casas", "casas para flip", "off-market", "oportunidades de compra", "subastas", "foreclosures", "wholesalers", "analiza esta casa" o pida actualizar el tablero de casas.
---

# Buscador de casas para flip — Imperial Remodeling

Responde siempre en español, con pasos claros y números concretos.

## Criterios de compra (no cambiar sin que el usuario lo pida)

| Criterio | Valor |
|---|---|
| Ciudades | **Solo Plano, Frisco y McKinney, TX** (Collin County; el oeste de Frisco es Denton County) |
| Tamaño | Alrededor de 1,500 sq ft: aceptar de 1,300 a 1,700 |
| Precio de compra | Hasta $300,000 |
| Tipo | Casa unifamiliar (no terrenos, no móviles; townhome solo si el usuario lo acepta) |
| Regla de entrada | Precio ≤ ARV × 70% − reparación |

Aviso que hay que repetirle al usuario cuando la búsqueda salga corta: en estas tres ciudades las casas de 1,500 sq ft
normalmente valen bastante más de $300,000, así que habrá pocas. Las que aparecen suelen ser casas de los años 60–80
en el este de Plano y el centro/este de McKinney, casas con daño, herencias, o subastas. No inventar resultados para
llenar la lista; decir cuántas se revisaron y cuántas pasaron.

## Tablero

- URL: https://claude.ai/artifact/SkhX3XKVS5Tp2s6Dwmkq4b
- Fuente del HTML: `tools/flip-finder/tablero.html` (para cambiar la página, editar ese archivo y republicar con `url`).
- Datos: colección `casas`, se lee y escribe con la herramienta `ArtifactData` (cargarla con ToolSearch si hace falta).

Campos de cada documento:

```json
{
  "direccion": "1234 Elm St", "ciudad": "Plano", "zip": "75074",
  "precio": 255000, "sqft": 1480, "camas": 3, "banos": 2, "anio": 1974,
  "arv": 395000, "reparacion": 45000, "costos_pct": 10,
  "estado": "nueva",
  "fuente": "Auction.com", "url": "https://...",
  "notas": "Subasta 1er martes; ocupada; techo viejo. ARV: 3 comparables a $262/sqft.",
  "creada": "2026-11-09T00:00:00Z", "origen": "agente"
}
```

- `estado`: `nueva`, `analizando`, `oferta`, `comprada`, `descartada`. El agente crea con `nueva`; nunca cambia el estado
  que el usuario ya puso.
- `doc_id`: dirección + zip en minúsculas con guiones (`1234-elm-st-75074`), para no duplicar.
- Números como números, sin `$` ni comas. Si no hay dato, omitir el campo (no poner 0).

## Pasos de cada búsqueda

1. **Leer el tablero** (`ArtifactData` `list` de `casas`) para saber qué ya existe y no duplicar.
2. **Buscar en las cuatro fuentes** (abajo) con WebSearch y leer cada página de resultado con el agente `web-fetch`.
   Lanzar las búsquedas en paralelo.
3. **Filtrar** por ciudad, sq ft y precio. Descartar lo que no se pueda verificar en la página (dirección, precio y
   sq ft deben salir de la fuente, no de memoria).
4. **Estimar ARV**: ventas cerradas de casas remodeladas, mismo vecindario o a menos de 0.5 milla, ±200 sq ft, últimos
   6 meses. ARV = $/sq ft promedio de 3 comparables × sq ft de la casa. Si no hay comparables confiables, dejar `arv`
   vacío y decirlo en `notas`.
5. **Estimar reparación** por sq ft (referencia DFW, ajustar con el criterio de Imperial):
   cosmético $20–30, medio (cocina, baños, pisos) $35–50, completo (más techo, HVAC, plomería o cimentación) $60–85.
6. **Calcular**: oferta máxima = ARV × 0.70 − reparación. Ganancia = ARV − compra − reparación − 10% del ARV
   (cierres, comisión de venta, tenencia). Veredicto: *Entra* si precio ≤ oferta máxima; *Negociar* si está hasta 8%
   arriba; *No entra* en otro caso.
7. **Guardar** las nuevas con `ArtifactData` `batch` (`op: "set"`). Para una casa que ya existe, usar `update` con su
   `if_version` y tocar solo precio, notas o datos nuevos.
8. **Informar** en el chat: tabla corta con dirección, precio, sq ft, ARV, reparación, oferta máxima, ganancia y
   veredicto; luego cuántas se revisaron, cuántas se guardaron, qué fuentes no se pudieron leer, y el siguiente paso
   de cada casa que entra (a quién llamar, fecha de subasta, dónde registrarse).

## Fuentes

**Subastas y foreclosures**
- auction.com, hubzu.com, xome.com/auctions: buscar por ciudad o "Collin County, TX".
- hudhomestore.gov, homepath.fanniemae.com: casas del gobierno y de Fannie Mae.
- taxsales.lgbs.com: ventas por impuestos de Collin County.
- Avisos de foreclosure de Collin County (County Clerk). En Texas la subasta es el primer martes de cada mes.

**Mayoristas**
- newwestern.com, investorlift.com, myhousedeals.com, biggerpockets.com (marketplace).
- Grupos de Facebook: "Collin County wholesale real estate", "DFW off market deals".
- Casi todo está detrás de registro. El agente no puede crear cuentas ni entrar con sesión: darle al usuario el enlace
  de registro y pedirle que pegue o reenvíe las listas que reciba, para analizarlas.

**Dueños directos**
- zillow.com/{plano,frisco,mckinney}-tx/fsbo/, dallas.craigslist.org/search/ndf/rea, Facebook Marketplace.
- collincad.org (dueño, valor fiscal, año). Señales de dueño motivado: dueño ausente, impuestos atrasados, herencia,
  violaciones de código, casa vacía.
- Listas masivas (pre-foreclosure, probate, impuestos) requieren PropStream u otra herramienta de pago del usuario.

**Listados envejecidos**
- Redfin, Zillow, Realtor.com: más de 90 días en el mercado, rebajas de precio, "fixer upper", "as-is",
  "investor special", "cash only", regresó al mercado.

Ejemplos de búsqueda: `"Plano TX" "as-is" OR "investor special" 3 bed 1500 sqft under 300000`,
`site:auction.com Plano TX`, `"McKinney, TX" foreclosure auction 75069`, `"Frisco TX" fsbo "needs work"`.

## Límites y reglas

- No pujar, ofertar, firmar ni registrarse a nombre del usuario. No contactar dueños ni mayoristas sin que el usuario
  lo pida y apruebe el mensaje; los borradores de correo van a Gmail como borrador.
- No enviar datos personales del usuario ni de Imperial a sitios externos.
- Respetar los términos de cada sitio: leer páginas públicas, no saltarse inicios de sesión ni captchas.
- Los números son estimados para decidir rápido, no un avalúo. Recordar: revisar título, impuestos pendientes,
  ocupación y la casa en persona antes de ofertar. En subastas se compra sin inspección y normalmente de contado.
- Marketing a dueños: respetar la lista de No Llamar y las reglas de Texas sobre solicitudes; el contrato de mayorista
  debe decir que se vende un interés en el contrato.
