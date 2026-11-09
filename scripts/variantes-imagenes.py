# Crea versiones más chicas de las fotos que se cargan al bajar por la página (loading="lazy")
# y del logo. El navegador elige la que necesita según el ancho en pantalla (srcset en
# src/data/imagenes.ts). Se guardan junto a la original como <nombre>-400w.webp y <nombre>-600w.webp.
# Uso: python scripts/variantes-imagenes.py
import re
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PUBLICO = RAIZ / 'public'
ANCHOS = (400, 600)      # deben coincidir con ANCHOS en src/data/imagenes.ts
MINIMO = 700             # solo fotos más anchas que esto
LOGO = '/assets/storage/2016/12/169471652699961817.webp'
ANCHOS_LOGO = (280,)  # a 560 casi no se ahorra; deben coincidir con el srcset del logo en Cabecera.astro y Pie.astro

fotos = set()
for html in (RAIZ / 'src' / 'contenido').rglob('index.html'):
    for img in re.findall(r'<img\b[^>]*>', html.read_text(encoding='utf-8')):
        src = re.search(r'\ssrc="(/assets/storage/[^"]+\.webp)"', img)
        if src and 'loading="lazy"' in img:
            fotos.add(src.group(1))


def variantes(f, anchos, calidad=78):
    origen = PUBLICO / f.lstrip('/')
    if not origen.exists():
        print('no existe', f)
        return
    im = Image.open(origen)
    if im.width <= MINIMO and f != LOGO:
        return
    for ancho in anchos:
        destino = origen.with_name(f'{origen.stem}-{ancho}w.webp')
        if destino.exists() or ancho >= im.width:
            continue
        chica = im.resize((ancho, round(im.height * ancho / im.width)), Image.LANCZOS)
        chica.save(destino, 'WEBP', quality=calidad, method=6)
        if destino.stat().st_size >= origen.stat().st_size:
            destino.unlink()


for f in sorted(fotos):
    variantes(f, ANCHOS)
variantes(LOGO, ANCHOS_LOGO, calidad=92)  # el logo lleva texto: más calidad
