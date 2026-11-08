---
type: guide
status: active
tags: [mymce, seo, google, dueño]
relatedTo: [pendientes-del-dueno, estrategia-primer-lugar]
---

# Lo que te toca a ti (mymce.com.mx)

Esto no lo puedo hacer yo: necesita tu cuenta, tu teléfono o una decisión tuya. Va en orden de impacto.

## 1. Darme el visto bueno para publicar

Hay commits listos en la rama `astro/sitio-residencial` que todavía no están en vivo: botones para cotizar, menú, artículo del blog, datos para Google, formularios más cortos, portafolio con la zona correcta y páginas en inglés. Solo dime "publícalo".

## 2. Google Search Console (15 min, una vez)

1. Entra a https://search.google.com/search-console con la cuenta de Google del negocio.
2. "Agregar propiedad" → "Dominio" → escribe `mymce.com.mx`.
3. Google te da un registro TXT. En Cloudflare: mymce.com.mx → DNS → Records → Add record → tipo TXT, nombre `@`, contenido el que te dio Google → Save. Regresa a Search Console y presiona "Verificar". Puede tardar unos minutos.
4. Menú izquierdo → Sitemaps → escribe `sitemap_mx.xml` → Enviar.
5. Arriba, en la barra de búsqueda, pega estas direcciones una por una y presiona "Solicitar indexación":
   - https://www.mymce.com.mx/
   - https://www.mymce.com.mx/servicios/cocinas/
   - https://www.mymce.com.mx/servicios/closets-vestidores/
   - https://www.mymce.com.mx/servicios/vestidores/
   - https://www.mymce.com.mx/servicios/cocinas-y-closets-villa-de-pozos/
   - https://www.mymce.com.mx/servicios/cocinas-y-closets-soledad-de-graciano-sanchez/
   - https://www.mymce.com.mx/en/
6. Cada lunes revisa "Rendimiento": qué búsquedas traen clics. Pásame la captura y ajusto textos.

## 3. Perfil de Negocio de Google (lo que más mueve las búsquedas locales)

En https://business.google.com:

1. **Sitio web:** que apunte a `https://www.mymce.com.mx/` (no a grupomymce).
2. **Categoría principal:** "Diseñador de cocinas" o "Tienda de cocinas". Secundarias: "Carpintero", "Proveedor de armarios", "Ebanista".
3. **Zonas de servicio:** San Luis Potosí, Soledad de Graciano Sánchez, Villa de Pozos.
4. **Nombre, dirección y teléfono** idénticos a los del pie de la página.
5. **Fotos:** sube 10 o más de obras reales (las mismas del portafolio sirven). Una foto nueva cada semana ayuda.
6. **Publicaciones:** una al mes; por ejemplo, el artículo "¿Qué determina el costo de una cocina integral?" con su enlace.
7. **Coordenadas:** abre tu negocio en Google Maps, mantén presionado el pin y copia los dos números (latitud, longitud). Mándamelos y los agrego a los datos de la página.

## 4. Reseñas de Google

Es lo que más falta. La competencia que sale primero tiene decenas.

1. En el Perfil de Negocio → "Pedir reseñas" → copia el enlace.
2. Mándalo por WhatsApp a cada cliente al terminar la instalación: "Gracias por confiar en MYMCE. ¿Nos ayudas con una reseña? Te toma un minuto: [enlace]".
3. Responde cada reseña, buena o mala, en menos de una semana.
4. Si un cliente te autoriza a mostrar su reseña en la página (sin apellido), pásamela y la pongo junto a los formularios.

## 5. Directorios y enlaces (una tarde)

Da de alta el negocio con el mismo nombre, dirección, teléfono y sitio web en:

- Houzz México (houzz.com.mx), con fotos del portafolio.
- Sección Amarilla.
- Facebook e Instagram: que el enlace de la biografía sea mymce.com.mx.
- Cámara de comercio o CMIC de San Luis Potosí, si son socios.
- Proveedores de herrajes o tableros que tengan directorio de distribuidores o fabricantes.

## 6. Decisiones que necesito de ti

- **Inglés:** ¿alguien del equipo atiende en inglés? Si sí, lo digo en las páginas en inglés. Si no, solo dicen "escríbenos en inglés por WhatsApp".
- **Dos teléfonos:** la página muestra 444-102-3917 y 444-233-5607 (WhatsApp). ¿Los dejo los dos, explicando cuál es cuál, o solo uno?
- **Páginas de fábrica en mymce** (maquila de partes, foil PVC, carpintería para cocinistas y constructoras): compiten con grupomymce. ¿Las paso a grupomymce con redirección?
- **Dos artículos de tendencias de color** casi iguales: ¿los junto en uno?
- **Correo de contacto:** la página de contacto muestra facturación antes que contacto. ¿Dejo solo contacto@?

## 7. Tu computadora

El disco C se llenó. Ya borré unos 33 GB de carpetas de pruebas. Si quieres más espacio:

- `Descargas\Telegram Desktop` ocupa 40 GB; revisa qué necesitas.
- Instaladores repetidos de Ableton en Descargas (~15 GB).
- Hibernación (25 GB): en PowerShell como administrador, `powercfg /h off`. Solo si no usas hibernar.

## 8. Decisión técnica: compresión contra el script de Cloudflare

Para quitar el error de consola que inyectaba Cloudflare, las páginas llevan `no-transform`. Lighthouse encontró que eso también impide que Cloudflare comprima el HTML: cada página pesa entre 24 y 80 KB más de lo necesario en celular. Mi recomendación es quitar `no-transform`, publicar y medir las dos cosas en vivo. Si el error de consola regresa, buscamos otra forma de bloquear el script. Dime si lo pruebo.
