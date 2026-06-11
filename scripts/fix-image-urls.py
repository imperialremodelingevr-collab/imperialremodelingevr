#!/usr/bin/env python3
"""Fix backgroundImage/src in section components to use quoted absolute paths."""
import glob
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sections = glob.glob(os.path.join(ROOT, "src", "components", "sections", "*.jsx"))
sections += [
    os.path.join(ROOT, "src", "components", "Hero.jsx"),
    os.path.join(ROOT, "src", "components", "sections", "CertsSection.jsx"),
    os.path.join(ROOT, "src", "components", "Nav.jsx"),
    os.path.join(ROOT, "src", "components", "Footer.jsx"),
    os.path.join(ROOT, "src", "components", "CertsSection.jsx"),
]

# build ext map from disk
img_dir = os.path.join(ROOT, "public", "images")
ext_map = {}
for fname in os.listdir(img_dir):
    if "." in fname:
        uid, ext = fname.rsplit(".", 1)
        if ext != "bin":
            ext_map[uid] = ext

def path_for(uid):
    ext = ext_map.get(uid, "jpg")
    return f'/images/{uid}.{ext}'

for fpath in sections:
    if not os.path.isfile(fpath):
        continue
    s = open(fpath, encoding="utf-8").read()
    orig = s

    # backgroundImage: `url(${img("uuid")})` -> backgroundImage: `url("/images/uuid.jpg")`
    s = re.sub(
        r'backgroundImage: `url\(\$\{img\("([0-9a-f-]+)"\)\}\)`',
        lambda m: f'backgroundImage: `url("{path_for(m.group(1))}")`',
        s,
    )
    s = re.sub(
        r"backgroundImage: `url\(\$\{img\('([0-9a-f-]+)'\)\}\)`",
        lambda m: f'backgroundImage: `url("{path_for(m.group(1))}")`',
        s,
    )

    # src={img('uuid')} -> src="/images/uuid.jpg"
    s = re.sub(
        r'src=\{img\([\'"]([0-9a-f-]+)[\'"]\)\}',
        lambda m: f'src="{path_for(m.group(1))}"',
        s,
    )

    if s != orig:
        open(fpath, "w", encoding="utf-8").write(s)
        print("fixed", os.path.basename(fpath))
