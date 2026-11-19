---
type: spec
status: complete
tags: [formulario, conversion, whatsapp, llamadas-a-la-accion, celular]
relatedTo: [resend-correos, reducir-whatsapp, cotizador-en-linea]
---

# Formularios y llamadas a la acción que venden

Status: completed

El dueño lo aprobó el 18 de noviembre de 2026 ("Sí, aplica las 7"), tomando como modelo lo que funciona en grupomymce (CPC).

## Qué se hace

1. **Un solo formulario para todo el sitio.** Sale de un solo lugar del código en lugar de las 17 copias a mano.
2. **"¿Qué quieres cotizar?" con botones:** Cocina, Closet o vestidor, Baño, Puertas y Otro. Cada página llega con su opción marcada.
3. **Solo nombre y WhatsApp/teléfono son obligatorios.** Correo y mensaje son opcionales. Se quitan "Comentarios adicionales" y "¿Qué día podemos contactarte?".
4. **Aviso claro junto al campo que falta,** en lugar del aviso genérico del navegador.
5. **Pantalla de después de enviar** con los siguientes pasos y el tiempo de respuesta ("desde unas horas hasta una semana, según el tamaño"), más un botón de WhatsApp con lo enviado ya escrito.
6. **Barra fija en celular** con Cotizar, Llamar y WhatsApp.
7. **WhatsApp con contexto:** los enlaces sin texto propio mandan la página de donde viene la persona. Los que ya tienen texto no cambian.

## Reglas que se respetan

- No se toca `functions/api/send-email.js` (ver `resend-correos.md`). El formulario manda los mismos campos `{name, email, phone, message, otherDetails}`.
- Las conversiones de Google Ads siguen igual.
- Sin cotizador ni precios (`cotizador-en-linea.md`, dropped).
- No se quita ningún punto de WhatsApp (`reducir-whatsapp.md`, dropped).

## Descartado en esta vuelta

- Folio, guardar solicitudes en D1 y archivos adjuntos: piden cambiar el envío de correos.
- Guardar el borrador en el navegador.
