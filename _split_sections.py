import re

base = r"c:/Users/imper/Downloads/Imperial Remodeling EVR/Codigo y Agentes/pajina wed imperial remodeling evr/imperialremodelingevr"
lines = open(base + "/_original_decoded.html", encoding="utf-8").read().splitlines()

markers = [
    ("topbar", "<!-- TOP BAR -->"),
    ("nav", "<!-- NAV -->"),
    ("hero", "<!-- HERO -->"),
    ("trust", "<!-- TRUST STRIP -->"),
    ("services", "<!-- SERVICES -->"),
    ("about", "<!-- ABOUT -->"),
    ("certs", "<!-- CREDENTIALS"),
    ("featured", "<!-- FEATURED PROJECT -->"),
    ("gallery", "<!-- GALLERY"),
    ("testimonials", "<!-- TESTIMONIALS -->"),
    ("contact", "<!-- CONTACT -->"),
    ("footer", "<footer"),
]

indices = []
for name, marker in markers:
    for i, line in enumerate(lines):
        if marker in line:
            indices.append((i, name))
            break

indices.sort()
out_dir = base + "/_sections"
import os
os.makedirs(out_dir, exist_ok=True)

for j, (start, name) in enumerate(indices):
    end = indices[j + 1][0] if j + 1 < len(indices) else len(lines)
    chunk = "\n".join(lines[start:end])
    # stop before i18n script
    if "<!-- ===================== I18N" in chunk:
        chunk = chunk.split("<!-- ===================== I18N")[0]
    open(f"{out_dir}/{name}.html", "w", encoding="utf-8").write(chunk)
    print(name, len(chunk))
