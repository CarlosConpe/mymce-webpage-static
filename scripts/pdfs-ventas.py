# Genera un PDF de ventas por fraccionamiento en docs/ventas/ con las obras del portafolio.
# Uso: python scripts/pdfs-ventas.py (necesita Pillow y reportlab).
import json, re, io, sys, os
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.graphics.barcode import qr
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from reportlab.pdfbase.pdfmetrics import stringWidth

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = REPO + '/docs/ventas'
os.makedirs(OUT, exist_ok=True)
AZUL = HexColor('#355669'); GRIS = HexColor('#555555'); CLARO = HexColor('#eef2f4')
W, H = A4; M = 40

FR = {
    'catara': ('Catara', 'Villa de Pozos', '/servicios/cocinas-y-closets-catara/'),
    'sirenia': ('Sirenia', 'Villa de Pozos', '/servicios/cocinas-y-closets-sirenia/'),
    'valle-real': ('Valle Real', 'Soledad de Graciano Sánchez', '/servicios/cocinas-y-closets-valle-real/'),
    'imperia': ('Imperia', 'San Luis Potosí', '/servicios/cocinas-y-closets-imperia/'),
}

def leer_portafolio():
    # Toma cada ficha del portafolio: descripción, fotos y la lista "Qué incluyó".
    import html as _html
    salida = []
    for p in json.load(open(REPO + '/src/data/paginas.json', encoding='utf-8')):
        r = p['ruta']
        if not r.startswith('/portafolio/') or r == '/portafolio/': continue
        t = open(REPO + '/src/contenido/' + p['archivo'], encoding='utf-8').read()
        imgs = re.findall(r'src="(/assets/storage/[^"]+)"', t)
        m = re.search(r'<ul>(.*?)</ul>', t, re.S)
        inc = [_html.unescape(re.sub('<[^>]+>', '', x)) for x in re.findall(r'<li>(.*?)</li>', m.group(1))] if m else []
        if not inc:
            i = t.find('Qué incluyó')
            inc = [_html.unescape(x) for x in re.findall(r'<label[^>]*>([^<]+)</label>', t[i:i + 3000])]
        salida.append(dict(slug=r.strip('/').split('/')[-1], desc=p['desc'], imgs=imgs[:8], incluye=inc[:8]))
    return salida

data = leer_portafolio()

def nombre_modelo(s):
    return ' '.join(w.capitalize() for w in s.split('-'))

def tipo(slug):
    if slug.startswith('cocina'): return (0, 'Cocina')
    if slug.startswith('closets-y-vestidores'): return (2, 'Closets y vestidor')
    return (1, 'Closets')

def resumen(desc):
    frases = re.split(r'(?<=\.)\s+', desc)
    keep = [f for f in frases if 'MYMCE' not in f]
    t = ' '.join(keep) or frases[0]
    return re.sub(r',?\s*(modelo|casa modelo)\s.*$', '.', t.split(',')[0]) if False else t

cache = {}
def foto(ruta, ancho_px=520):
    if ruta not in cache:
        im = Image.open(REPO + '/public' + ruta).convert('RGB')
        im.thumbnail((ancho_px, ancho_px * 2))
        b = io.BytesIO(); im.save(b, 'JPEG', quality=72, optimize=True); b.seek(0)
        cache[ruta] = (ImageReader(b), im.size)
    return cache[ruta]

def caja_foto(c, ruta, x, y, w, h):
    # Recorta al centro para llenar la caja sin deformar.
    img, (iw, ih) = foto(ruta)
    escala = max(w / iw, h / ih)
    dw, dh = iw * escala, ih * escala
    c.saveState()
    p = c.beginPath(); p.rect(x, y, w, h); c.clipPath(p, stroke=0, fill=0)
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
    c.restoreState()

def parrafo(c, texto, x, y, ancho, fuente='Helvetica', tam=10.5, color=GRIS, interlinea=1.4):
    c.setFont(fuente, tam); c.setFillColor(color)
    palabras = texto.split(); linea = ''
    for p in palabras:
        prueba = (linea + ' ' + p).strip()
        if stringWidth(prueba, fuente, tam) > ancho:
            c.drawString(x, y, linea); y -= tam * interlinea; linea = p
        else:
            linea = prueba
    if linea: c.drawString(x, y, linea); y -= tam * interlinea
    return y

def pie(c, n, frac):
    c.setFont('Helvetica', 8); c.setFillColor(GRIS)
    c.drawString(M, 22, f'MYMCE · Cocinas y closets en {frac}')
    c.drawRightString(W - M, 22, f'www.mymce.com.mx · WhatsApp 444 233 5607 · {n}')

def encabezado(c, titulo, sub=None):
    c.setFillColor(AZUL); c.rect(0, H - 70, W, 70, fill=1, stroke=0)
    c.setFillColor(white); c.setFont('Helvetica-Bold', 20); c.drawString(M, H - 42, titulo)
    if sub: c.setFont('Helvetica', 10.5); c.drawString(M, H - 59, sub)

def qr_en(c, url, x, y, tam):
    w = qr.QrCodeWidget(url); b = w.getBounds()
    d = Drawing(tam, tam, transform=[tam / (b[2] - b[0]), 0, 0, tam / (b[3] - b[1]), 0, 0]); d.add(w)
    renderPDF.draw(d, c, x, y)

for clave, (frac, municipio, ruta) in FR.items():
    obras = [o for o in data if f'-{clave}-modelo-' in o['slug']]
    modelos = {}
    for o in obras:
        modelos.setdefault(o['slug'].split('-modelo-')[1], []).append(o)
    for m in modelos.values(): m.sort(key=lambda o: tipo(o['slug'])[0])
    orden = sorted(modelos)
    n_coc = sum(1 for o in obras if o['slug'].startswith('cocina'))
    n_clo = len(obras) - n_coc
    url = 'https://www.mymce.com.mx' + ruta
    archivo = f'{OUT}/mymce-{clave}.pdf'
    c = canvas.Canvas(archivo, pagesize=A4)
    c.setTitle(f'MYMCE · Cocinas y closets en {frac}, {municipio}'); c.setAuthor('MYMCE'); c.setSubject('Obras de MYMCE por modelo de casa')
    pag = 1

    # Portada
    cocinas = [o for o in obras if o['slug'].startswith('cocina')]
    portada = next(i for i in cocinas[0]['imgs'] if i.endswith('.webp'))
    caja_foto(c, portada, 0, H * 0.38, W, H * 0.62)
    c.setFillColor(AZUL); c.rect(0, 0, W, H * 0.38, fill=1, stroke=0)
    logo = Image.open(REPO + '/public/assets/storage/2016/12/logo-2.webp').convert('RGBA')
    fondo = Image.new('RGBA', (logo.width + 24, logo.height + 16), (255, 255, 255, 255)); fondo.paste(logo, (12, 8), logo)
    b = io.BytesIO(); fondo.convert('RGB').save(b, 'PNG'); b.seek(0)
    c.drawImage(ImageReader(b), M, H - 40 - 46, 46 * fondo.width / fondo.height, 46)
    c.setFillColor(white); c.setFont('Helvetica-Bold', 30)
    c.drawString(M, H * 0.38 - 70, f'Cocinas y closets en {frac}')
    c.setFont('Helvetica', 14); c.drawString(M, H * 0.38 - 94, f'{municipio}, San Luis Potosí')
    y = parrafo(c, f'{n_coc} cocinas y {n_clo} proyectos de closets y vestidores que diseñamos, fabricamos e instalamos en {len(orden)} modelos de casa del fraccionamiento. Si tu casa es de uno de estos modelos, puedes ver cómo quedó y tomarlo como punto de partida.', M, H * 0.38 - 130, W - 2 * M, tam=12, color=white)
    c.setFont('Helvetica-Bold', 11); c.drawString(M, 60, 'WhatsApp 444 233 5607  ·  Tel. 444 102 3917  ·  www.mymce.com.mx')
    c.showPage(); pag += 1

    # Qué hacemos y cómo trabajamos
    encabezado(c, 'Quiénes somos', 'Fábrica de carpintería en San Luis Potosí con casi 40 años de trabajo')
    y = H - 110
    y = parrafo(c, 'MYMCE es Cocinas, Puertas y Closets S.A. de C.V. Diseñamos, fabricamos e instalamos a la medida cocinas integrales, closets, vestidores, puertas, muebles de baño y escritorios. Las piezas se cortan con maquinaria CNC en nuestra planta de Av. Promoción 110, Industrial San Luis, y la instalación la hace nuestro propio equipo.', M, y, W - 2 * M, tam=11.5)
    y -= 18
    c.setFont('Helvetica-Bold', 15); c.setFillColor(AZUL); c.drawString(M, y, 'Cómo trabajamos'); y -= 26
    pasos = [
        ('Cita', 'Nos escribes por WhatsApp, nos llamas o llenas el formulario de la página, y agendamos.'),
        ('Medición en sitio', 'Vamos a tu casa a medir. Aunque el modelo sea el mismo, los muros cambian de una casa a otra.'),
        ('Diseño', 'Hacemos el diseño contigo: distribución, materiales y colores, con las muestras en la mano. Lo ajustamos hasta que lo apruebas.'),
        ('Fabricación', 'Cortamos con maquinaria CNC en nuestra planta. Los gabinetes son de melamina; los frentes, de melamina o MDF, liso o con foil PVC.'),
        ('Instalación', 'Nuestro equipo instala y ajusta cada pieza en tu casa.'),
    ]
    for i, (t, d) in enumerate(pasos, 1):
        c.setFillColor(AZUL); c.circle(M + 11, y + 4, 11, fill=1, stroke=0)
        c.setFillColor(white); c.setFont('Helvetica-Bold', 11); c.drawCentredString(M + 11, y, str(i))
        c.setFillColor(AZUL); c.setFont('Helvetica-Bold', 12); c.drawString(M + 32, y, t)
        y = parrafo(c, d, M + 32, y - 16, W - 2 * M - 32, tam=10.5) - 10
    y -= 6
    c.setFillColor(CLARO); c.rect(M, y - 160, W - 2 * M, 160, fill=1, stroke=0)
    c.setFont('Helvetica-Bold', 12); c.setFillColor(AZUL); c.drawString(M + 14, y - 22, 'Bueno saber')
    datos = ['Normalmente entregamos en unas 3 semanas hábiles; en proyectos grandes, la fecha va en la cotización.',
             'Un año de garantía. No cubre daños por mal uso; arreglarlos tiene costo adicional.',
             'Te mandamos la cotización desde unas horas hasta una semana después, según el tamaño del proyecto.',
             'Todas las fotos son de obras que instalamos.',
             'Pagos: transferencia, tarjeta de crédito o débito, cheque o efectivo.',
             'La consulta es gratis. También vendemos electrodomésticos para cocina.']
    yy = y - 42
    for d in datos:
        c.setFillColor(GRIS); c.setFont('Helvetica', 10.5); c.drawString(M + 14, yy, '•')
        yy = parrafo(c, d, M + 26, yy, W - 2 * M - 40, tam=10.5, interlinea=1.35) - 3
    pie(c, pag, frac); c.showPage(); pag += 1

    # Una página por modelo
    def lineas(texto, ancho, tam=9.5):
        out, l = [], ''
        for p in texto.split():
            pr = (l + ' ' + p).strip()
            if stringWidth(pr, 'Helvetica', tam) > ancho and l: out.append(l); l = p
            else: l = pr
        return out + [l]
    col = (W - 2 * M) / 2
    for mod in orden:
        lista = modelos[mod]
        encabezado(c, f'Modelo {nombre_modelo(mod)}', f'{frac}, {municipio}')
        y = H - 92
        alto_sec = (H - 92 - 50) / len(lista)
        for o in lista:
            inc = o['incluye'][:6]
            filas = []
            for k in range(0, len(inc), 2):
                par_ = [lineas(x, col - 22) for x in inc[k:k + 2]]
                filas.append(par_)
            alto_inc = sum(max(len(p) for p in fila) * 12 + 3 for fila in filas)
            desc_l = len(lineas(resumen(o['desc']), W - 2 * M, 10))
            todas = [i for i in o['imgs'] if i.endswith('.webp')]
            fotos = todas[:6] if len(lista) == 1 and len(todas) >= 5 else todas[:3]
            n = min(len(fotos), 3); hueco = 8; filas_f = (len(fotos) + 2) // 3
            fw = (W - 2 * M - hueco * (n - 1)) / max(n, 1)
            fh = min(fw * 4 / 3, (alto_sec - 24 - desc_l * 14 - alto_inc - 40 - hueco * (filas_f - 1)) / filas_f)
            c.setFillColor(AZUL); c.setFont('Helvetica-Bold', 13); c.drawString(M, y - 6, tipo(o['slug'])[1])
            y = parrafo(c, resumen(o['desc']), M, y - 24, W - 2 * M, tam=10)
            if len(lista) == 1 and 3 <= len(todas) < 5:
                # Una sola obra con pocas fotos: una grande a la izquierda y dos apiladas a la derecha.
                alto = alto_sec - 24 - desc_l * 14 - alto_inc - 40
                wg = (W - 2 * M - hueco) * 0.6; wc = W - 2 * M - hueco - wg
                caja_foto(c, todas[0], M, y - alto - 4, wg, alto)
                caja_foto(c, todas[1], M + wg + hueco, y - (alto - hueco) / 2 - 4, wc, (alto - hueco) / 2)
                caja_foto(c, todas[2], M + wg + hueco, y - alto - 4, wc, (alto - hueco) / 2)
                y = y - alto - 20
            else:
                for k, ft in enumerate(fotos):
                    caja_foto(c, ft, M + (k % 3) * (fw + hueco), y - fh - 4 - (k // 3) * (fh + hueco), fw, fh)
                y = y - filas_f * fh - (filas_f - 1) * hueco - 20
            c.setFillColor(GRIS); c.setFont('Helvetica', 9.5)
            for fila in filas:
                for k, ls in enumerate(fila):
                    cx = M + k * col
                    c.drawString(cx, y, '•')
                    for q, l in enumerate(ls): c.drawString(cx + 10, y - q * 12, l)
                y -= max(len(p) for p in fila) * 12 + 3
            y -= 18
        pie(c, pag, frac); c.showPage(); pag += 1

    # Contacto
    encabezado(c, '¿Tu casa es de uno de estos modelos?', 'Te cotizamos con el plano o unas fotos de tu espacio')
    y = H - 120
    y = parrafo(c, f'Puedes tomar cualquiera de estas obras como punto de partida y cambiar colores, materiales o distribución. Mándanos el plano de tu casa, unas fotos del espacio o simplemente el modelo, y te damos una primera idea antes de ir a medir.', M, y, W - 2 * M, tam=12)
    y -= 20
    filas = [('WhatsApp', '444 233 5607'), ('Teléfono', '444 102 3917'), ('Correo', 'contacto@grupomymce.com'),
             ('Planta', 'Av. Promoción 110, Industrial San Luis, San Luis Potosí, S.L.P. 78395'),
             ('Horario', 'Lunes a viernes, de 9:00 a 18:00'), ('Página', 'www.mymce.com.mx')]
    for k, v in filas:
        c.setFillColor(AZUL); c.setFont('Helvetica-Bold', 12); c.drawString(M, y, k)
        c.setFillColor(GRIS); c.setFont('Helvetica', 12); c.drawString(M + 90, y, v); y -= 24
    y -= 20
    qr_en(c, url, M, y - 130, 130)
    parrafo(c, f'Escanea para ver todas nuestras obras en {frac} con más fotos:', M + 150, y - 40, W - 2 * M - 150, tam=11.5)
    c.setFillColor(AZUL); c.setFont('Helvetica', 10); c.drawString(M + 150, y - 80, url)
    c.linkURL(url, (M, y - 130, M + 130, y), relative=0)
    c.linkURL(url, (M + 150, y - 84, W - M, y - 70), relative=0)
    pie(c, pag, frac); c.showPage()
    c.save()
    print(archivo, pag, 'páginas', round(os.path.getsize(archivo) / 1024), 'KB', 'modelos', len(orden))
