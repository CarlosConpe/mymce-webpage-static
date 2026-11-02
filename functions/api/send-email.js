const CORREO_VALIDO = /^[A-Za-z0-9._%+'-]{1,64}@[A-Za-z0-9.-]{1,190}\.[A-Za-z]{2,}$/;
const MAX_CUERPO = 64 * 1024;
const respuesta = (datos, status = 200) => new Response(JSON.stringify(datos), { status, headers: { "Content-Type": "application/json" } });
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const texto = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "").trim().slice(0, max);

// Límite por visitante dentro de cada instancia: frena ráfagas de bots sin guardar datos.
const visitas = new Map();
function excede(ip, maximo = 5, segundos = 600) {
  const ahora = Date.now() / 1000;
  const lista = (visitas.get(ip) || []).filter((t) => t > ahora - segundos);
  if (lista.length >= maximo) return true;
  lista.push(ahora);
  visitas.set(ip, lista);
  if (visitas.size > 5000) visitas.clear();
  return false;
}

export async function onRequestPost({ request, env }) {
  try {
    // Solo se aceptan envíos desde este mismo sitio.
    const origen = request.headers.get("Origin");
    if (!origen || new URL(origen).host !== new URL(request.url).host) return respuesta({ error: "Solicitud no permitida" }, 403);
    if (Number(request.headers.get("Content-Length") || 0) > MAX_CUERPO) return respuesta({ error: "El mensaje es demasiado largo" }, 413);
    const crudo = await request.text();
    if (crudo.length > MAX_CUERPO) return respuesta({ error: "El mensaje es demasiado largo" }, 413);
    const cuerpo = JSON.parse(crudo) || {};
    const extra = cuerpo.otherDetails && typeof cuerpo.otherDetails === "object" ? cuerpo.otherDetails : {};

    // Trampa para bots: campo invisible que una persona nunca llena.
    if (texto(extra.sitio_web, 200)) return respuesta({ success: true });
    delete extra.sitio_web;

    const correo = texto(cuerpo.email, 254);
    const nombreLimpio = texto(cuerpo.name, 120);
    const telefono = texto(cuerpo.phone, 40);
    if (!nombreLimpio || (!correo && !telefono)) return respuesta({ error: "Faltan datos: nombre y correo o teléfono" }, 400);
    if (correo && !CORREO_VALIDO.test(correo)) return respuesta({ error: "Revisa tu correo" }, 400);
    if (excede(request.headers.get("CF-Connecting-IP") || "local")) return respuesta({ error: "Demasiados envíos. Inténtalo más tarde o escríbenos por WhatsApp." }, 429);

    if (!env.RESEND_API_KEY) {
      console.error("Falta RESEND_API_KEY");
      return respuesta({ error: "No se pudo enviar" }, 500);
    }

    const RESEND_FROM = env.RESEND_FROM || "onboarding@resend.dev";
    const RESEND_TO = env.RESEND_TO || "contacto@grupomymce.com";
    const LOGO_URL = "https://www.mymce.com.mx/assets/storage/2016/12/logo-2.webp";

    // Todo lo que llega del visitante se escapa antes de entrar al correo.
    const name = esc(nombreLimpio);
    const email = esc(correo || "no proporcionado");
    const phone = esc(telefono || "no proporcionado");
    const message = esc(texto(cuerpo.message, 6000) || "(sin mensaje)");
    const otherDetails = {};
    for (const [k, v] of Object.entries(extra).slice(0, 30)) {
      const valor = texto(typeof v === "object" ? "" : v, 1000);
      if (valor) otherDetails[esc(texto(k, 80))] = esc(valor);
    }

    // Format Extra Details Table
    let extraDetailsRows = "";
    if (Object.keys(otherDetails).length > 0) {
      extraDetailsRows = `
          <div style="margin-top: 30px;">
            <h3 style="color: #355669; font-size: 16px; border-bottom: 2px solid #eee; padding-bottom: 10px;">Detalles Adicionales</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              ${Object.entries(otherDetails).map(([key, value]) => `
                <tr>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #666; width: 40%;"><strong>${key}</strong></td>
                  <td style="padding: 10px; border-bottom: 1px solid #f0f0f0; color: #333;">${value}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `;
    }

    // Modern HTML Template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; color: #333; }
          .container { width: 100%; max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 4px solid #355669; }
          .header img { max-height: 50px; width: auto; }
          .content { padding: 40px; }
          .tag { display: inline-block; background: #e3f2fd; color: #1565c0; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
          h2 { color: #1a1a1a; margin: 10px 0 30px 0; font-size: 24px; font-weight: 700; line-height: 1.2; }
          .field { margin-bottom: 20px; }
          .label { display: block; color: #8898aa; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; }
          .value { display: block; font-size: 16px; color: #333; font-weight: 500; }
          .message-box { background-color: #f8f9fa; border-left: 4px solid #ab1dfe; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; color: #555; line-height: 1.6; font-style: italic; }
          .cta-row { margin-top: 30px; text-align: center; }
          .btn { display: inline-block; background-color: #355669; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .footer { background-color: #eff2f7; padding: 20px; text-align: center; font-size: 12px; color: #999; }
          a { color: #355669; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${LOGO_URL}" alt="MYMCE Logo">
          </div>
          <div class="content">
            <span class="tag">NUEVO LEAD</span>
            <h2>Has recibido un nuevo mensaje de contacto</h2>
            
            <div style="display: flex; flex-wrap: wrap;">
              <div class="field" style="width: 50%;">
                <span class="label">Nombre</span>
                <span class="value">${name}</span>
              </div>
              <div class="field" style="width: 50%;">
                <span class="label">Teléfono</span>
                <span class="value">${phone}</span>
              </div>
              <div class="field" style="width: 100%;">
                <span class="label">Correo Electrónico</span>
                <span class="value"><a href="mailto:${email}">${email}</a></span>
              </div>
            </div>

            <div class="field">
              <span class="label">Mensaje</span>
              <div class="message-box">
                "${message.replace(/\n/g, '<br>')}"
              </div>
            </div>

            ${extraDetailsRows}

            <div class="cta-row">
              <a href="mailto:${email}" class="btn">Responder Ahora</a>
            </div>
          </div>
          <div class="footer">
            <p>Este correo fue enviado automáticamente desde <strong>mymce.com.mx</strong></p>
            <p>© ${new Date().getFullYear()} MYMCE. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `MYMCE Web <${RESEND_FROM}>`,
        to: [RESEND_TO],
        ...(correo ? { reply_to: correo } : {}),
        subject: `🔔 Nuevo Lead: ${nombreLimpio.replace(/[\r\n]+/g, " ")}`,
        html: htmlContent,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Resend rechazó el correo", resendResponse.status, (await resendResponse.text()).slice(0, 300));
      return respuesta({ error: "No se pudo enviar" }, 502);
    }

    return respuesta({ success: true });

  } catch (err) {
    console.error("Error en el formulario", err.message);
    return respuesta({ error: "Solicitud no válida" }, 400);
  }
}
