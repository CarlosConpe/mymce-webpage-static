export async function onRequestPost({ request, env }) {
    try {
        const { name, email, phone, message, otherDetails } = await request.json();

        if (!env.RESEND_API_KEY) {
            return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), { status: 500 });
        }

        // Default configuration (User should configure these ENV vars in Cloudflare)
        const RESEND_FROM = env.RESEND_FROM || "onboarding@resend.dev"; // Or specific domain
        const RESEND_TO = env.RESEND_TO || "contacto@grupomymce.com";

        // Construct Email Body
        const htmlContent = `
      <h2>Nuevo Mensaje de Contacto (Sitio Web)</h2>
      <p><strong>Nombre:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${phone}</p>
      <p><strong>Mensaje:</strong></p>
      <blockquote style="background: #f9f9f9; padding: 10px; border-left: 3px solid #ccc;">
        ${message.replace(/\n/g, '<br>')}
      </blockquote>
      <hr>
      <h3>Detalles Adicionales:</h3>
      <pre>${JSON.stringify(otherDetails, null, 2)}</pre>
    `;

        // Call Resend API
        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${env.RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: `MYMCE Web <${RESEND_FROM}>`,
                to: [RESEND_TO],
                reply_to: email, // Allow direct reply to user
                subject: `Nuevo Lead por Web: ${name}`,
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
