---
type: doc
status: active
updated: 2026-11-09
tags: [mymce, seo, google, google-business, directorios, dueño]
relatedTo: [pendientes-del-dueno, estrategia-primer-lugar, plan-ventas-seo]
---

# Lo que te toca a ti (mymce.com.mx)

Actualizado el 9 de noviembre de 2026. Todo lo que estaba en la rama ya está publicado. Lo que sigue necesita tu cuenta de Google, tus fotos o un dato que solo tú sabes. Va en orden de impacto.

## 1. Google Search Console (15 minutos, una sola vez)

1. Entra a https://search.google.com/search-console con la cuenta de Google del negocio.
2. "Agregar propiedad" → "Prefijo de URL" → escribe `https://www.mymce.com.mx/`. (Si prefieres cubrir todo el dominio, elige "Dominio" y pon `mymce.com.mx`; Google te dará un registro TXT que se agrega en Cloudflare → DNS → Add record, tipo TXT, nombre `@`.)
3. Presiona "Verificar".
4. Menú izquierdo → Sitemaps → escribe `sitemap_mx.xml` → Enviar.
5. En la barra de arriba pega cada dirección, espera a que cargue y presiona "Solicitar indexación":
   - https://www.mymce.com.mx/servicios/cocinas-y-closets-catara/
   - https://www.mymce.com.mx/servicios/cocinas-y-closets-sirenia/
   - https://www.mymce.com.mx/servicios/cocinas-y-closets-valle-real/
   - https://www.mymce.com.mx/servicios/cocinas-y-closets-imperia/
   - https://www.mymce.com.mx/corporate/blog/2026/11/09/closet-o-vestidor-como-elegir/
   - https://www.mymce.com.mx/corporate/blog/2026/11/09/como-cuidar-tus-muebles-de-cocina-y-closet/
   - https://www.mymce.com.mx/corporate/blog/2026/11/09/melamina-o-mdf-para-tu-cocina/
6. Google deja pedir unas 10 al día. Si te dice que llegaste al límite, sigue mañana.
7. Cada lunes abre "Rendimiento" y mándame una captura. Con eso ajusto títulos y textos.

## 2. Ficha de Google Business de MYMCE

Todo está listo para copiar y pegar en [google-business/ficha.md](google-business/ficha.md): nombre, dirección, teléfonos, descripción, categorías, servicios, horario, zonas y atributos. Entra a https://business.google.com y llénala con ese archivo abierto al lado.

Las cuatro publicaciones de diciembre, con su foto y su enlace, están en [google-business/publicaciones-2026-12.md](google-business/publicaciones-2026-12.md). Sube una cada martes.

## 3. Directorios (una tarde)

Da de alta el negocio con exactamente el mismo nombre, dirección, teléfono y sitio web en:

- Sección Amarilla
- Cylex
- Hotfrog
- Cámaras de San Luis Potosí donde estén afiliados (Canaco, CMIC, Canacintra)

## 4. Datos y fotos que me faltan

Sin esto no puedo terminar algunas páginas, y no invento nada:

- **Foto de un escritorio hecho por ustedes.** La tarjeta de Escritorios todavía usa una foto de oficina tipo banco de imágenes.
- **Fotos de muebles de baño ya instalados.**
- **Fotos de piezas con foil PVC** (puertas o frentes terminados).
- **Foil PVC en el portafolio:** ¿cuáles de las cocinas del portafolio llevan foil?
- **Maquila:** ¿atienden solo en el estado o en todo el país?

Tiempos de entrega, garantía, electrodomésticos e inglés ya los tomé del FAQ. Mándame lo demás como vaya saliendo, no hace falta juntarlo todo.

## 5. Activar la medición de clientes (10 minutos)

El sitio ya cuenta los clics a WhatsApp, teléfono, correo y formularios por página, pero solo los guarda cuando conectas una base de datos gratis de Cloudflare. Los pasos están en [medicion.md](medicion.md):

1. Crear la base D1 `mymce-clics`.
2. Conectarla al proyecto de Pages con el nombre `DB`.
3. Activar Cloudflare Web Analytics en el mismo proyecto.

## 6. Usar las plantillas y los PDF de venta

- [plantillas-respuesta.md](plantillas-respuesta.md) tiene los mensajes para WhatsApp y correo, desde el primer contacto hasta el seguimiento. Cambia lo que va entre [CORCHETES] antes de mandar.
- En `docs/ventas/` hay un PDF por fraccionamiento (Catara, Sirenia, Valle Real, Imperia) con las obras de cada modelo de casa. Mándalo por WhatsApp a quien te escriba desde ese fraccionamiento, o imprímelo para la visita.

