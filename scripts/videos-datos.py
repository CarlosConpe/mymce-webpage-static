# Lee duración y fecha de los videos propios del sitio y las guarda en src/data/videos.json,
# para que las páginas publiquen su VideoObject sin inventar datos.
# Uso: python scripts/videos-datos.py (necesita ffprobe en el PATH).
import glob, json, os, re, subprocess

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SALIDA = os.path.join(REPO, 'src', 'data', 'videos.json')


def fuentes():
    vistos = set()
    for f in glob.glob(os.path.join(REPO, 'src', 'contenido', '**', 'index.html'), recursive=True):
        rel = os.path.relpath(f, os.path.join(REPO, 'src', 'contenido')).replace(os.sep, '/')
        t = open(f, encoding='utf-8').read()
        for src in re.findall(r'<source[^>]*src="(/assets/storage/[^"]+\.mp4)"', t):
            # Solo los propios: el promocional y los de cada obra del portafolio.
            if src.endswith('mymce-promocional.mp4') or rel.startswith('portafolio/'):
                vistos.add(src)
    return sorted(vistos)


def duracion(ruta):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', ruta], capture_output=True, text=True)
    s = round(float(r.stdout.strip()))
    return f'PT{s // 60}M{s % 60}S' if s >= 60 else f'PT{s}S'


def fecha(src):
    # Los videos de las obras llevan la fecha de grabación en el nombre (20230708_...).
    m = re.search(r'/(20\d{2})(\d{2})(\d{2})_', src)
    if m:
        return f'{m.group(1)}-{m.group(2)}-{m.group(3)}'
    r = subprocess.run(['git', 'log', '--diff-filter=A', '--format=%aI', '--', 'public' + src], cwd=REPO, capture_output=True, text=True)
    lineas = r.stdout.strip().splitlines()
    return lineas[-1][:10] if lineas else None


datos = {}
for src in fuentes():
    ruta = os.path.join(REPO, 'public', src.lstrip('/'))
    if not os.path.exists(ruta):
        print('falta', src)
        continue
    datos[src] = {'duracion': duracion(ruta), 'fecha': fecha(src)}
json.dump(datos, open(SALIDA, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(datos), 'videos;', sum(1 for d in datos.values() if not d['fecha']), 'sin fecha')
