
/* 
 * Performance Optimization: Reflow Mitigation
 * - Ensure scroll handlers are passive where possible
 * - Using CSS transitions instead of JS animation where possible
 */
// Centralized Scripts

document.addEventListener('DOMContentLoaded', function() {
//<![CDATA[
        var ajax_url = '/ajax-call';
        //]]>

//<![CDATA[
var ajax_url='/ajax-call';
//]]>

//<![CDATA[
        jQuery(function (jQuery) { jQuery.datepicker.setDefaults({ "closeText": "Cerrar", "currentText": "Hoy", "monthNames": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], "monthNamesShort": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], "nextText": "Siguiente", "prevText": "Previo", "dayNames": ["domingo", "lunes", "martes", "mi\u00e9rcoles", "jueves", "viernes", "s\u00e1bado"], "dayNamesShort": ["dom", "lun", "mar", "mi\u00e9", "jue", "vie", "s\u00e1b"], "dayNamesMin": ["D", "L", "M", "X", "J", "V", "S"], "dateFormat": "d MM, yy", "firstDay": 1, "isRTL": false }); });
        //]]>

//<![CDATA[
    var ajax_url = '/ajax-call';
    //]]>

//<![CDATA[
    jQuery(function (jQuery) { jQuery.datepicker.setDefaults({ "closeText": "Cerrar", "currentText": "Hoy", "monthNames": ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], "monthNamesShort": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"], "nextText": "Siguiente", "prevText": "Previo", "dayNames": ["domingo", "lunes", "martes", "mi\u00e9rcoles", "jueves", "viernes", "s\u00e1bado"], "dayNamesShort": ["dom", "lun", "mar", "mi\u00e9", "jue", "vie", "s\u00e1b"], "dayNamesMin": ["D", "L", "M", "X", "J", "V", "S"], "dateFormat": "d MM, yy", "firstDay": 1, "isRTL": false }); });
    //]]>

function filterPortfolio(category, btn) {
    // Update Active Button
    var buttons = document.querySelectorAll('.portfolio-filters .btn');
    buttons.forEach(function(b) { b.classList.remove('active'); });
    btn.classList.add('active');

    // Filter Items
    var items = document.querySelectorAll('.portfolio-item');
    items.forEach(function(item) {
        if (category === 'all' || item.classList.contains('cat-' + category)) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

});