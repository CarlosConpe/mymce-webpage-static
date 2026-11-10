// Cuenta clics de contacto (WhatsApp, teléfono, correo y formulario) por página.
// Se guarda en D1 solo si el proyecto tiene el binding DB; sin él responde 204 y no hace nada.
// No se guarda IP, navegador, cookies ni nada que identifique a la persona: solo día, tipo y ruta.
const TIPOS = new Set(["whatsapp", "telefono", "correo", "formulario"]);
const vacia = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
let tablaLista = false;

export async function onRequestPost({ request, env }) {
  try {
    if (!env.DB) return vacia();
    const origen = request.headers.get("Origin");
    if (origen && new URL(origen).host !== new URL(request.url).host) return vacia();
    const crudo = (await request.text()).slice(0, 600);
    const { tipo, pagina } = JSON.parse(crudo || "{}");
    if (!TIPOS.has(tipo) || typeof pagina !== "string" || !pagina.startsWith("/")) return vacia();
    const ruta = pagina.split(/[?#]/)[0].slice(0, 200);
    if (!tablaLista) {
      await env.DB.prepare(
        "CREATE TABLE IF NOT EXISTS clics (dia TEXT NOT NULL, tipo TEXT NOT NULL, pagina TEXT NOT NULL, total INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (dia, tipo, pagina))"
      ).run();
      tablaLista = true;
    }
    const dia = new Date().toISOString().slice(0, 10);
    await env.DB.prepare(
      "INSERT INTO clics (dia, tipo, pagina, total) VALUES (?1, ?2, ?3, 1) ON CONFLICT (dia, tipo, pagina) DO UPDATE SET total = total + 1"
    ).bind(dia, tipo, ruta).run();
  } catch {
    // Un conteo perdido no debe afectar a quien visita la página.
  }
  return vacia();
}
