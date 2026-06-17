document.addEventListener("DOMContentLoaded", function() {
    // Configuration
    const user = "midogiova";
    const domain = "gmail.com";
    const email = `${user}@${domain}`;
    
    // 1. Mise à jour de l'année
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Obfuscation des liens mailto
    const contactLinks = document.querySelectorAll('[id^="contact-link"], .js-obfuscated-email');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const subject = link.dataset.subject || "Demande de projet";
            const body = link.dataset.body || "Bonjour Giovanny,";
            link.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        });
    });

    // 3. Copie de l'email
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function() {
            navigator.clipboard.writeText(email).then(() => {
                const originalText = this.innerHTML;
                this.innerText = "Email copié !";
                this.style.color = "#22c55e";
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.color = "";
                }, 2000);
            });
        });
    }

    // 4. Gestion générique des formulaires (Mailto fallback)
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            const botCheck = document.getElementsByName("_gotcha")[0]?.value;
            if (botCheck) { e.preventDefault(); return; }
            
            // Si on utilise Mailto par défaut
            if (!contactForm.action || contactForm.action === window.location.href) {
                e.preventDefault();
                const msg = document.getElementById("message").value;
                window.location.href = `mailto:${email}?subject=Nouveau Message&body=${encodeURIComponent(msg)}`;
            }
        });
    }
});