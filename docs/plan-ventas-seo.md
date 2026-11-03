# Plan para que mymce.com.mx venda más y posicione mejor

Fecha: 3 de noviembre de 2026.

Sale de seis análisis hechos sobre la versión nueva, que todavía no está publicada:
- SEO técnico
- datos estructurados
- SEO local
- velocidad
- búsquedas y competencia
- conversión

Se comparó con la auditoría del sitio en vivo del 29 de octubre, que calificó 81/100.

## En una línea

El sitio ya está técnicamente sano. Tiene 0 enlaces rotos, 0 títulos duplicados y las 109 direcciones viejas siguen funcionando. Para vender más, lo que falta no es técnico:
- datos de confianza verificables
- reseñas reales
- un camino corto para pedir cotización
- páginas para lo que la gente busca y hoy no tiene página

---

## 1. Urgente: esta semana (lo haces tú)

| # | Qué | Por qué | Esfuerzo |
|---|---|---|---|
| 1 | **Decidir un solo nombre, dirección, teléfono y horario** y usarlo en todos lados | Hoy hay tres teléfonos y dos direcciones distintos entre el sitio, grupomymce.com y Sección Amarilla. Google desconfía cuando no coinciden | Bajo |
| 2 | **Publicar la rama nueva de grupomymce.com** | El sitio en vivo todavía muestra Israel 448, 444 821 4890 y horario de 8:30. La rama nueva ya trae los datos correctos | Bajo (requiere tu visto bueno) |
| 3 | **Reclamar o crear el Perfil de Negocio de Google** con esos datos | Es lo que más pesa para salir en el mapa y en las búsquedas "cerca de mí". La guía está en `docs/google-business-profile.md` del repo de grupomymce | Medio |
| 4 | **Corregir la ficha de Sección Amarilla** ("Cocinas Puertas y Closets SA de CV": Israel 448, 444 821 1917) | Es la cita con datos viejos más visible | Bajo |
| 5 | **Confirmar o quitar el "+52 800-00-MYMCE"** de Contacto | No es un número real y resta confianza | Bajo |
| 6 | **Redirigir mymce.com.mx a www.mymce.com.mx** en Cloudflare (Reglas › Redirect Rules, plan gratis) | Hoy las dos direcciones abren el sitio y Google ve contenido duplicado. Esto no se puede hacer desde el código | 5 minutos |

## 2. Decisión que solo tú puedes tomar

**mymce.com.mx y grupomymce.com compiten entre sí en Google.** En la búsqueda "cocinas integrales san luis potosi" salen los dos, con las mismas páginas de cocinas, closets y el portafolio de las 84 casas. La versión nueva de grupomymce sigue publicando el portafolio de casas modelo.

Opciones:
- **Recomendada:** que grupomymce.com indique a Google que la página original de cada cocina, closet y ficha del portafolio es la de mymce.com.mx (etiqueta *canonical* entre dominios). grupomymce.com se queda con lo B2B: maquila nacional, fabricantes y exportación.
- Alternativa: quitar esas páginas de grupomymce.com y redirigirlas a mymce.com.mx.

## 3. Lo que necesito que me pases para el contenido

Sin estos datos no se pueden escribir las mejoras que más venden:

1. **Garantía:** cuántos años, qué cubre, qué no y cómo se reclama. Los competidores ponen "1 año"; MYMCE solo dice "ofrecemos garantía".
2. **Tiempos reales:**
   - de la visita a la cotización
   - de la aprobación a la instalación, para una cocina y para un closet típicos
   - tiempo de maquila
3. **Visita de medición:** si cuesta, qué zonas cubre y qué lleva el asesor (muestras, render).
4. **Forma de pago:**
   - anticipo
   - número de pagos
   - meses sin intereses, si hay
   - factura
5. **Diseño previo:** ¿entregan render o diseño por computadora antes de aprobar? ¿Sin costo? El principal competidor lo anuncia como "gratis".
6. **Materiales y herrajes que usan,** y para cada ficha del portafolio: material, color, cubierta y herrajes.
7. **Fotos y video propios** del taller, del equipo y de una instalación. Sirven para reemplazar el video extranjero de Constructoras y el de obra en polvo de la portada.
8. **Sala de exhibición:** ¿existe y se puede visitar?
9. **Reseñas:** pedirlas en Google a 10 clientes particulares recientes. Con su permiso, 3 o 4 frases con nombre de pila y fraccionamiento.
10. **Logo cuadrado** de al menos 512×512 px (Google pide mínimo 112×112) y la URL del Perfil de Google ya creado.

## 4. Cambios en la página para vender más

Ordenados por impacto entre esfuerzo. Ninguno publica precios ni nombres de clientes corporativos.

### Primera semana (alto impacto, poco esfuerzo)

1. **Formularios cortos.** Hoy piden de 6 a 8 campos y 5 o 6 son obligatorios. El servidor solo necesita nombre y teléfono o correo.
   - Quedarían seis campos: nombre, WhatsApp o teléfono (obligatorios), "¿Qué necesitas?" (lista), municipio o fraccionamiento, mensaje y correo.
   - Fuera: apellido, "¿Qué día podemos contactarte?", "Comentarios adicionales" y "¿Cómo te enteraste?".
   - Botón: "Pedir mi diseño y cotización".
2. **Mensaje después de enviar con siguiente paso.** "Te contactamos en menos de 24 horas hábiles para agendar la visita…", más un botón "Enviar fotos de tu espacio por WhatsApp". Si falla el envío, ofrecer WhatsApp y teléfono.
3. **Fichas del portafolio.**
   - El botón "¡Comprar en Línea!" lleva a Contacto y no hay tienda; cambiarlo por "Quiero una cocina como esta".
   - Que abra WhatsApp con el modelo ya escrito: "Vi la cocina Dalí de Catara…".
4. **Botón para cotizar en la primera pantalla** de Cocinas y Particulares, como ya lo tiene Closets ("Agendar visita de diseño").
5. **Quitar lo que resta confianza:**
   - barras de "85 %" que no miden nada
   - la frase cortada "Por mencionar solo algunas de ellas."
   - el video de un trabajador extranjero en Constructoras
6. **Un solo sufijo en los títulos:** "| MYMCE". Hoy se mezclan "| Grupo MYMCE", "| MYMCE" y "| MYMCE SLP", y se confunde con el sitio B2B.

### Dos a cuatro semanas

7. **Nueva primera pantalla de la portada.**
   - Antetítulo "Fabricamos en San Luis Potosí desde 1987".
   - Botón principal para cotizar y botón secundario "Ver 84 trabajos terminados".
   - Franja de datos sin adjetivos: desde 1987 · 84 casas modelo en Catara, Sirenia, Valle Real e Imperia · fábrica propia · instalación propia · garantía de [dato].
   - El selector de tipo de cliente pasa abajo, y "Clientes Finales" se llama "Para mi casa".
8. **Trabajos dentro de Cocinas y Closets.** Seis fichas reales con "Ver las 45 cocinas". Hoy esas páginas no enlazan ni una ficha.
9. **Sección "Antes de decidir"** en Cocinas, Closets y Particulares: cuánto tarda, garantía, visita, cómo se paga y de qué depende el precio. Con los datos del punto 3.
10. **Reseñas visibles** (cuando existan): 3 a 6 en portada y servicios, con enlace a "Ver todas en Google".
11. **Bloque "Así se fabrica tu cocina"** con fotos reales del taller.
12. **Quitar frases de relleno** en todo el sitio: "la mejor calidad", "de tus sueños", "superar tus expectativas", "líder". Si una frase le serviría igual a un competidor, se cambia por un dato.

### Después

13. **Páginas de soluciones con contenido propio para cada tipo de cliente.**
    - Constructoras: producción por lote y entregas por etapa.
    - Arquitectos: trabajo a partir de planos.
    - Cocinistas: maquila y despiece.
14. **Correo de confirmación al cliente** al enviar el formulario. Resend ya está integrado y es gratis hasta cierto volumen.

## 5. SEO: qué cambiar para posicionar

### Páginas nuevas (lo que la gente busca y hoy no tiene página)

| Página | Búsquedas que ataca | Por qué |
|---|---|---|
| **Vestidores** (`/servicios/vestidores/`) | vestidores san luis potosi, vestidor a medida, cuánto cuesta un vestidor | Nadie tiene una página fuerte. Ya hay unas 30 fichas de vestidores |
| **Cocinas modernas** (galería por estilo) | cocinas integrales modernas slp, con isla, con barra, pequeñas | El competidor que va primero gana con una página así |
| **"¿De qué depende el precio de una cocina integral en SLP?"** | precio, cuánto cuesta, metro lineal, económicas | MYMCE no aparece; hoy ganan Habitissimo, Home Depot y Mercado Libre. Se explica sin publicar cifras |
| **Guía de materiales:** melamina, MDF, foil PVC y chapa | melamina vs mdf, cocina de mdf, puertas de pvc | Búsqueda frecuente y sin dueño local |
| **Zona de servicio:** SLP, Soledad y Villa de Pozos | cocinas integrales en soledad, closets soledad | Hueco claro; tiene que llevar datos reales, no una plantilla con el nombre de la ciudad cambiado |
| **Puertas por tipo** (interior, tambor, corrediza, closet) | puertas de madera slp, puertas interiores | Hoy solo hay una página general |
| **Medidas estándar de cocina y closet** | cocina integral medidas estándar | Búsqueda informativa que atrae clientes |

### Arreglos en lo que ya existe

1. **Fichas gemelas.** 24 pares de fichas (la cocina y el closet de la misma casa) comparten el 90 % del texto y compiten entre sí. Además, siete fichas de "cocina" hablan del vestidor. Hay que darle a cada una dos o tres frases propias (distribución, material, color) o marcar una como la principal.
2. **Títulos y descripciones.**
   - 41 descripciones terminan con la misma frase de plantilla.
   - 68 títulos pasan de 60 caracteres.
   - Ya hay propuestas escritas para soluciones, contacto y preguntas frecuentes.
3. **Enlaces internos.**
   - Cada ficha recibe los mismos enlaces que la página de Cocinas, porque el menú lista las 84 fichas. Eso diluye la autoridad.
   - Hay que agregar enlaces de contenido: ficha → servicio, ficha → otros modelos del mismo fraccionamiento, artículo del blog → servicio.
   - Decisión tuya: reducir el menú del portafolio a 4 fraccionamientos.
4. **Las dos páginas de foil PVC en español** tratan casi lo mismo. Hay que fusionarlas o separarlas con claridad (cliente final y cocinista).
5. **Maquila nacional:** que la posicione grupomymce.com y que mymce.com.mx no compita por esa búsqueda.
6. **Textos alternativos de fotos.** Hoy solo hay 94 distintos en 926 fotos. En las fichas deberían decir "Cocina integral modelo Van Gogh, fraccionamiento Catara, foto 2".
7. **Datos estructurados** para Google:
   - tipo de negocio de construcción y hogar
   - zonas atendidas
   - un "Service" por servicio
   - "BlogPosting" en los cuatro artículos
   - logo cuadrado
   - El código está listo en el análisis; falta el logo y las coordenadas confirmadas.
8. **Blog:** está parado desde julio de 2023. Con uno o dos artículos al mes sobre las búsquedas de la tabla de arriba basta.

## 6. Velocidad

Medida en el servidor local; la cifra definitiva saldrá de PageSpeed ya publicado.

| Página | Celular hoy (en vivo) | Celular nueva versión |
|---|---|---|
| Portada | 99 | 100 |
| Cocinas | 74 | 88 |
| Particulares | 71 | 78 |

Pendiente:
- **Fotos responsivas** (`srcset`): hoy el celular descarga fotos de 1920 px. Ahorra entre 40 y 120 KB por página.
- **Miniaturas de 400 px en el portafolio:** hoy son de 768 px.
- **Íconos:** la fuente de íconos pesa 76 KB y se usan pocos.

## 7. Herramientas que conviene poner (todas gratis)

| Herramienta | Para qué | Estado |
|---|---|---|
| **Google Search Console** | Ver qué buscan para llegar, en qué posición sale cada página y qué errores ve Google. Indispensable para medir este plan | Revisar que mymce.com.mx esté verificado y que el sitemap `sitemap_mx.xml` esté enviado |
| **Perfil de Negocio de Google** | Mapa, reseñas, llamadas y "cómo llegar". Es el canal local que más vende | Por crear o reclamar |
| **Bing Webmaster Tools** | Bing alimenta a ChatGPT y a Copilot. Se importa desde Search Console en 2 minutos | Por dar de alta |
| **Microsoft Clarity** | Grabaciones y mapas de calor: dónde se atoran los clientes en el formulario. Ya lo usa grupomymce.com | Por agregar a mymce.com.mx |
| **Cloudflare Web Analytics** | Visitas sin cookies, incluido en el plan gratis | Activar en el panel |
| **Google Tag Manager + Google Ads** | Ya están. Falta medir clics en teléfono y en "Quiero una como esta" | Agregar eventos |
| **Cloudflare Turnstile** | Bloquear formularios de bots sin captcha molesto. Gratis | Opcional; hoy hay trampa invisible |
| **WhatsApp Business** | Catálogo con fotos del portafolio, respuestas rápidas, mensaje de ausencia fuera de horario y etiquetas por etapa (nuevo, visitado, cotizado, cerrado) | Configurar en el teléfono |
| **Enlace corto de reseña de Google + QR** | Mandarlo por WhatsApp al terminar cada instalación y ponerlo impreso en la entrega | Al crear el perfil |
| **Looker Studio** | Tablero mensual: búsquedas (Search Console), contactos (Ads) y reseñas | Cuando ya haya un mes de datos |
| **Directorios gratis** (Bing Places, Apple Business Connect, Facebook, Houzz, Habitissimo, Cronoshare, Construex) | Más citas con los mismos datos y enlaces al sitio | Después de fijar los datos únicos |

Un CRM de pago o el rastreo de llamadas no hacen falta por ahora. Con las etiquetas de WhatsApp Business y una hoja de cálculo alcanza para seguir cada cliente.

## 8. Lo que ya quedó hecho hoy

En la versión nueva, sin publicar:
- **Seis videos en formato HEVC convertidos a H.264.** En Firefox y en muchas computadoras con Windows no se reproducían. Uno pesaba 25.5 MB, casi el límite de Cloudflare, y podía hacer fallar la publicación.
- **Los videos grandes, recomprimidos.** Ahora solo se descargan cuando se van a ver.
- **Teléfono y WhatsApp tocables en el pie** de todas las páginas.
- **Campos de teléfono** que abren el teclado numérico en celular.
- **Cocinistas:** los enlaces que no llevaban a ningún lado ya tienen destino.
- **Par de idiomas español e inglés** declarado para Google en las páginas de foil PVC.
- **Archivo `llms.txt`** para buscadores con IA.
- **Para Google:**
  - quité del mapa del sitio el ícono de carga del formulario
  - la dirección técnica de Cloudflare ya no se indexa
  - el formulario tampoco se indexa

## 9. Lo que no se pudo medir

- **Volúmenes de búsqueda y autoridad del dominio.** Ahrefs ya no responde con el plan actual. La prioridad de las búsquedas salió del autocompletado de Google México.
- **El mapa de Google y las reseñas de la competencia.** Google bloquea las consultas automáticas. Toma 15 minutos a mano: hacer las seis búsquedas principales en Google Maps y anotar los tres primeros, con su calificación y número de reseñas.
- **Datos reales de visitas y contactos.** No hay acceso a Search Console ni a Analytics. Por eso cada impacto es una estimación.
