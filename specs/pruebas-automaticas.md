---
type: spec
status: draft
tags: [pruebas, npm-test, reglas-del-dueno, calidad]
relatedTo: []
---

# Pruebas automáticas para `npm test`

Status: not started

CLAUDE.md pide que `npm test` pase antes de publicar. Hoy la carpeta `tests/` no existe y nunca ha existido: `node --test "tests/*.test.mjs"` termina con código 0 y "tests 0", así que pasa sin revisar nada. Esto salió en el sweep del 18 de noviembre de 2026. El dueño decidió mantener la regla y crear pruebas de verdad.

## Qué deben revisar (sobre `dist/`, después del build)

- Que no aparezcan tolerancias numéricas ("±" ni `&plusmn;`).
- Que no aparezcan los datos que no se publican: Israel 448, 821-19-17, 821-48-90, el correo de live.com.mx ni el RFC.
- Que no aparezca "de madera" como material ("cocina de madera", "puertas de madera", "madera sólida", "madera maciza").
- Que no haya marcado `Review` ni `AggregateRating`, ni bloques de testimonios.
- Que no haya `rel=canonical` ni redirecciones en `public/_redirects` hacia grupomymce.com.
- Que cada página tenga al menos un enlace de WhatsApp.
- Que los JSON-LD sean JSON válido y que no haya dos nodos distintos con el mismo `@id` en una página.

## Fuera de alcance

- Revisar marcas en fotos: no se puede hacer por texto.
- Pruebas de navegador o de Lighthouse.
