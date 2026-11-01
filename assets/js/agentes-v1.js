// WebMCP: da a los agentes del navegador los datos para contactar a MYMCE. No envía nada.
(function () {
  var contexto = document.modelContext || navigator.modelContext;
  if (!contexto || !contexto.registerTool) return;
  var herramienta = {
    name: 'datos_de_contacto',
    description: 'Devuelve el teléfono, WhatsApp, dirección, horario y página de contacto de MYMCE, carpintería residencial en San Luis Potosí.',
    inputSchema: { type: 'object', properties: {} },
    execute: function () {
      return Promise.resolve({ content: [{ type: 'text', text: 'Teléfono: +52 444 102 3917. WhatsApp: +52 444 233 5607. Dirección: Av. Promoción 110, Industrial San Luis, 78395 San Luis Potosí. Horario: lunes a viernes, 9:00 a 18:00. Contacto: https://www.mymce.com.mx/corporate/contact/' }] });
    }
  };
  Promise.resolve().then(function () { return contexto.registerTool(herramienta); }).catch(function () {});
})();
