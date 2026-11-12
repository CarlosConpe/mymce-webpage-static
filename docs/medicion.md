---
type: doc
status: active
updated: 2026-11-10
tags: [mymce, medicion, cloudflare-d1, cloudflare-web-analytics, pages-functions, contactos]
relatedTo: [lo-que-te-toca-a-ti, plan-ventas-seo]
---

# Medir qué páginas traen clientes

El sitio cuenta cada vez que alguien toca WhatsApp, el teléfono o el correo, o manda un formulario de cotización o contacto. Para cada clic guarda tres datos: el día, el tipo de contacto y la página donde pasó. No usa cookies y no guarda IP, navegador ni nada que identifique a la persona.

## Cómo funciona

- `src/scripts/sitio.js` manda un `navigator.sendBeacon` a `/api/clic` con `{ tipo, pagina }`. El aviso pesa menos de 100 bytes y sale después del clic, así que no frena la página ni cambia Lighthouse.
- `functions/api/clic.js` recibe el aviso. Si el proyecto tiene el binding `DB`, suma uno en la tabla `clics` (la crea sola la primera vez). Si no hay `DB`, responde 204 y no hace nada.
- Los tipos válidos son `whatsapp`, `telefono`, `correo` y `formulario`. El formulario se cuenta solo cuando el envío salió bien.
- El día se guarda en hora UTC. Un clic después de las 6 de la tarde en San Luis Potosí aparece con la fecha del día siguiente.

## Activarlo (10 minutos, una vez)

### 1. Crear la base D1 (gratis)

1. Entra a https://dash.cloudflare.com → Storage & Databases → D1 SQL Database → Create.
2. Nombre: `mymce-clics`. Ubicación: la que sugiera. Create.

El plan gratis de D1 da de sobra para este conteo.

### 2. Conectarla al proyecto de Pages

1. Workers & Pages → el proyecto de mymce → Settings → Bindings → Add → D1 database.
2. Variable name: `DB` (así, en mayúsculas). Database: `mymce-clics`. Save.
3. Hazlo en Production. Si quieres contar también las vistas previas, repítelo en Preview.
4. El binding entra con la siguiente publicación. Si no hay cambios pendientes, en Deployments → el último → "Retry deployment".

### 3. Activar Cloudflare Web Analytics

Esto da visitas por página, de dónde llegan y qué dispositivo usan, sin cookies.

1. Workers & Pages → el proyecto de mymce → Metrics → Web Analytics → Enable.
2. No hace falta tocar el código: Cloudflare agrega su script al publicar. La política de seguridad del sitio ya permite `static.cloudflareinsights.com`.

## Ver el resumen

En D1 → `mymce-clics` → Console, pega una de estas consultas.

Contactos por página en los últimos 30 días:

```sql
SELECT pagina,
       SUM(total) AS contactos,
       SUM(CASE WHEN tipo = 'whatsapp'   THEN total ELSE 0 END) AS whatsapp,
       SUM(CASE WHEN tipo = 'telefono'   THEN total ELSE 0 END) AS telefono,
       SUM(CASE WHEN tipo = 'correo'     THEN total ELSE 0 END) AS correo,
       SUM(CASE WHEN tipo = 'formulario' THEN total ELSE 0 END) AS formulario
FROM clics
WHERE dia >= date('now', '-30 days')
GROUP BY pagina
ORDER BY contactos DESC;
```

Contactos por mes y tipo:

```sql
SELECT substr(dia, 1, 7) AS mes, tipo, SUM(total) AS contactos
FROM clics
GROUP BY mes, tipo
ORDER BY mes DESC, contactos DESC;
```

Para saber qué páginas convierten mejor, cruza los contactos de una página con sus visitas en Web Analytics del mismo periodo.

## Probarlo después de activarlo

1. Abre cualquier página de www.mymce.com.mx y toca el botón de WhatsApp.
2. En la consola de D1 corre `SELECT * FROM clics ORDER BY dia DESC LIMIT 5;`. Debe aparecer la página con `whatsapp` y total 1.

## Avisar a Bing con IndexNow

IndexNow le avisa a Bing (y a los buscadores que usan su índice, como Copilot) qué páginas cambiaron, para que no esperen a volver a rastrear. Google no lo usa; para Google siguen el sitemap y Search Console.

- La clave está en `public/ce2bdd8a826f903e373d55c7e6c89d4e.txt` y se publica con el sitio. No la borres ni la cambies.
- Unos minutos después de cada publicación corre `npm run avisar-indexnow`. El script lee el sitemap en vivo, compara una huella de cada página con la de la vez anterior (guardada en `.indexnow/estado.json`, fuera de git) y manda solo las páginas nuevas, las que cambiaron y las que salieron del sitemap.
- `npm run avisar-indexnow -- --prueba` muestra qué mandaría sin avisar. `-- --todas` manda todas.
- La primera vez en cada computadora manda las 129 páginas, porque no hay huellas guardadas. Es normal y no tiene costo.
