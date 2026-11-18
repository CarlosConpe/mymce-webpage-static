# mymce.com.mx (sitio residencial de MYMCE)

Sitio para familias de San Luis Potosí que buscan cocinas, closets, vestidores, puertas y muebles de baño. El sitio para empresas es grupomymce.com, en otro repo (`../mymce-webpage-static - Copy (3)`). El tono "para la familia" aplica solo aquí.

## Cómo trabajar aquí

- Astro estático en Cloudflare Pages. Rama de trabajo: `astro/sitio-residencial`.
- El contenido de cada página está en `src/contenido/**/index.html` y sus datos (título, descripción, idiomas) en `src/data/paginas.json`. Un icono `fa fa-*` se ve si `src/data/iconos.ts` lo cambia por SVG o si su glifo está en la fuente de `src/styles/sitio.css` (o en `correcciones.css`); si no está en ninguno, no se ve.
- Antes de publicar, corre los tres y que pasen: `npm run build`, `npm run check` ("Sin errores.") y `npm test`.
- Publicar es `git push origin HEAD:master`, y solo con aprobación explícita del dueño.
- IndexNow avisa solo después de cada push (`.github/workflows/indexnow.yml`). Google solo usa el sitemap y Search Console.
- Pendientes y descartes: `specs/`. Respeta su `Status:`.

## Reglas del dueño (no se negocian)

1. **Clientes confidenciales.** Nunca escribas nombres de clientes ni de constructoras. Los fraccionamientos (Catara, Sirenia, Valle Real, Imperia) sí se pueden nombrar. La lista de clientes está en la memoria privada, no aquí.
2. **Sin marcas de proveedores** de material ni de maquinaria, tampoco en fotos.
3. **Sin precios publicados** en las páginas de servicio. Se explica qué mueve el costo y se invita a cotizar.
4. **Sin reseñas ni testimonios.**
5. **No quitar WhatsApp.** Se puede mejorar el texto o el lugar, pero nunca bajar el número de puntos de contacto. Sí está aprobado ocultar el botón flotante mientras se ve el de la cabecera.
6. **Sitios separados.** Nunca redirijas, canonicalices ni fusiones páginas entre mymce.com.mx y grupomymce.com.
7. **Sin tolerancias numéricas** (nada de "±X mm").
8. **Ubicaciones correctas:** Catara y Sirenia están en Villa de Pozos, Valle Real en Soledad de Graciano Sánchez e Imperia en la zona del Aguaje, en San Luis Potosí.
9. **Datos que no se publican:** la dirección vieja de Israel 448, los teléfonos 821-19-17 y 821-48-90, el correo de live.com.mx y el RFC.
10. **Solo servicios gratis de Cloudflare.**

## Datos del negocio que sí se pueden usar

- Planta: Av. Promoción 110, Industrial San Luis, San Luis Potosí. Casi 40 años de oficio.
- Teléfono 444 102 3917. Horario: lunes a viernes, de 9:00 a 18:00 corrido.
- Entrega: normalmente 3 semanas hábiles. En proyectos grandes, la fecha va en la cotización.
- Cotización: gratis, y se responde desde unas horas hasta una semana según el tamaño.
- Garantía: 12 meses desde el acta de entrega-recepción. No cubre mal uso.
- Todas las fotos del portafolio son obras que instaló el dueño.

## Textos

Español de México, cálido y claro, para familias. Pasa la prosa nueva por la skill humanizer. No inventes datos: si falta uno, pregúntalo.
