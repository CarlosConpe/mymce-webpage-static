document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll("form[data-worker-form='true']");

    forms.forEach((form) => {
        form.addEventListener("submit", async function (e) {
            e.preventDefault();

            // UI Elements
            const loader = form.querySelector(".cf-loader");
            const successBox = form.querySelector(".success-box");
            const errorBox = form.querySelector(".error-box");
            const submitBtn = form.querySelector("button[type='submit']");

            // Reset UI
            if (successBox) successBox.style.display = "none";
            if (errorBox) errorBox.style.display = "none";
            if (loader) loader.style.display = "inline-block";
            if (submitBtn) submitBtn.disabled = true;

            // Gather Data
            const formData = new FormData(form);
            const data = {
                name: (formData.get("Nombre *") || "") + " " + (formData.get("Apellido *") || ""),
                email: formData.get("Correo *") || "",
                phone: formData.get("Teléfono *") || "",
                message: formData.get("Mensaje *") || "",
                otherDetails: {}
            };

            // Collect extra fields dynamically
            formData.forEach((value, key) => {
                if (!["Nombre *", "Apellido *", "Correo *", "Teléfono *", "Mensaje *", "_subject"].includes(key)) {
                    data.otherDetails[key] = value;
                }
            });

            try {
                const response = await fetch("/api/send-email", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                });

                if (response.ok) {
                    if (successBox) {
                        successBox.style.display = "block";
                        // Optionally hide form
                        // form.reset();
                    } else {
                        alert("Mensaje enviado con éxito!");
                    }
                } else {
                    console.error("Server Error:", await response.text());
                    if (errorBox) errorBox.style.display = "block";
                    else alert("Error al enviar el mensaje.");
                }
            } catch (err) {
                console.error("Network Error:", err);
                if (errorBox) errorBox.style.display = "block";
            } finally {
                if (loader) loader.style.display = "none";
                if (submitBtn) submitBtn.disabled = false;
            }
        });
    });
});
