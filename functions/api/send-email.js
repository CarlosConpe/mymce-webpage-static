export async function onRequestPost({ request, env }) {
    try {
        const { name, email, phone, message, otherDetails } = await request.json();

        if (!env.RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
        }

        const RESEND_FROM = env.RESEND_FROM || "onboarding@resend.dev";
        const RESEND_TO = env.RESEND_TO || "contacto@grupomymce.com";
        const LOGO_URL = "https://www.grupomymce.com/assets/storage/2016/12/mymce-logo-1664856016.webp";

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
            <p>Este correo fue enviado automáticamente desde <strong>grupomymce.com</strong></p>
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
                reply_to: email,
                subject: `🔔 Nuevo Lead: ${name}`,
                html: htmlContent,
            }),
        });

        if (!resendResponse.ok) {
            const errorText = await resendResponse.text();
            return new Response(JSON.stringify({ error: "Resend API Error", details: errorText }), { status: 500 });
        }

        const data = await resendResponse.json();
        return new Response(JSON.stringify({ success: true, id: data.id }), {
            headers: { "Content-Type": "application/json" },
            status: 200,
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Invalid request", details: err.message }), { status: 400 });
    }
}
