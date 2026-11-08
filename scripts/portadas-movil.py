# Crea la versión para celular de cada foto grande de encabezado: recortada al formato
# de la pantalla del teléfono y más ligera. Se guarda junto a la original como <nombre>-movil.webp.
# Uso: python scripts/portadas-movil.py
import re
from pathlib import Path
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PUBLICO = RAIZ / 'public'
FORMATO = 1.3   # ancho entre alto del encabezado en un celular de hasta 480 px
ANCHO = 900
# Fotos cuyo encabezado se alinea a un lado (ver correcciones.css).
LADO = {'2025/11/x.webp': 'derecha', 'Diseno-sin-titulo2-horno': 'izquierda'}

fotos = set()
for html in (RAIZ / 'src' / 'contenido').rglob('index.html'):
    fotos.update(re.findall(r'class="header-title[^"]*"[^>]*background-image:url\(([^)]+)\)', html.read_text(encoding='utf-8')))
fotos.add('/assets/storage/2023/08/cocina-17-5-1920x1080.webp')  # portada del portafolio, en correcciones.css

for f in sorted(fotos):
    origen = PUBLICO / f.lstrip('/')
    destino = origen.with_name(origen.stem + '-movil.webp')
    if not origen.exists():
        print('no existe', f)
        continue
    im = Image.open(origen).convert('RGB')
    w, h = im.size
    if w / h > FORMATO:
        nw = round(h * FORMATO)
        lado = next((v for k, v in LADO.items() if k in f), 'centro')
        x = {'izquierda': 0, 'derecha': w - nw}.get(lado, (w - nw) // 2)
        im = im.crop((x, 0, x + nw, h))
    if im.width > ANCHO:
        im = im.resize((ANCHO, round(im.height * ANCHO / im.width)), Image.LANCZOS)
    im.save(destino, 'WEBP', quality=72, method=6)
    if destino.stat().st_size >= origen.stat().st_size:
        destino.unlink()
        print('sin ahorro', f)
