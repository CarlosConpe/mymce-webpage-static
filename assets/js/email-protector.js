/**
 * Email Protection Script
 * 
 * Reconstructs 'mailto:' links at runtime to bypass Cloudflare's 
 * email obfuscation which generates broken /cdn-cgi/l/email-protection links.
 * 
 * Usage:
 * <a href="#" class="protected-email" data-u="user" data-d="domain.com" data-replace-text="true">
 *    (Optional placeholder text)
 * </a>
 */
document.addEventListener("DOMContentLoaded", function() {
    var elements = document.getElementsByClassName("protected-email");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var u = el.getAttribute("data-u");
        var d = el.getAttribute("data-d");
        
        if (u && d) {
            var email = u + "@" + d;
            el.setAttribute("href", "mailto:" + email);
            
            // If the link text itself should be the email address
            if (el.getAttribute("data-replace-text") === "true") {
                el.innerText = email;
            }
        }
    }
});
