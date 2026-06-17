document.addEventListener("DOMContentLoaded", function () {
    // Configuration
    const user = "midogiova";
    const domain = "gmail.com";
    const email = `${user}@${domain}`;

    // 1. Mise à jour de l'année dans le footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // 2. Obfuscation des liens mailto
    const contactLinks = document.querySelectorAll('[id^="contact-link"], .js-obfuscated-email');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            let subject = "Demande de projet"; // Default subject
            let body = "Bonjour Giovanny,"; // Default body

            // Specific handling for js-obfuscated-email links with data-type
            if (link.classList.contains('js-obfuscated-email')) {
                const type = link.dataset.type;
                if (type === 'audit-video') {
                    subject = "Demande d'Audit Vidéo Express";
                    body = "Bonjour Giovanny, je souhaiterais un audit pour mon site : (insérer URL)";
                } else if (type === 'workshop') {
                    subject = "Réservation Workshop Stratégique";
                    body = "Bonjour Giovanny, je souhaite réserver un workshop pour mon projet.";
                } else if (type === 'mentoring') {
                    subject = "Candidature Mentoring Mensuel";
                    body = "Bonjour Giovanny, je souhaite postuler pour le mentoring mensuel.";
                }
            } else if (link.id === 'contact-link') { // Main contact link on index.html
                subject = "Demande de projet - Consultation";
                body = "Bonjour Giovanny,\n\nJe souhaiterais discuter d'un projet avec vous.\n\nType de projet : (Tunnel de vente / Site Web / Audit / Autre)\nObjectif : \nSite actuel (si existant) : \n\nMerci.";
            }

            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
>>>>>>> 73c99ac (feat: ajustement des couleurs SVG pour thème sombre et correction App.jsx)
        });
    });

    // 3. Copie de l'email
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
<<<<<<< HEAD
        copyBtn.addEventListener('click', function () {
=======
        copyBtn.addEventListener('click', function () {
>>>>>>> 73c99ac (feat: ajustement des couleurs SVG pour thème sombre et correction App.jsx)
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

<<<<<<< HEAD
    // 4. Gestion générique des formulaires (Mailto fallback)
    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            const botCheck = document.getElementsByName("_gotcha")[0]?.value;
            if (botCheck) { e.preventDefault(); return; }

            // Si on utilise Mailto par défaut
            if (!contactForm.action || contactForm.action === window.location.href) {
                e.preventDefault();
                const msg = document.getElementById("message").value;
                window.location.href = `mailto:${email}?subject=Nouveau Message&body=${encodeURIComponent(msg)}`;
            }
        });
=======
    // 4. Gestion des formulaires de contact (Mailto fallback)
    document.querySelectorAll(".contact-form").forEach(contactForm => {
        // Gestion du bouton de copie d'email spécifique à ce formulaire
        const copyBtn = contactForm.querySelector('#copy-email-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function () {
                navigator.clipboard.writeText(email).then(() => {
                    const originalText = this.innerHTML;
                    this.innerText = "Email copié !";
                    this.style.color = "#22c55e";
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.style.color = ""; // Réinitialise la couleur
                    }, 2000);
                });
            });
        }

        // Gestion de la soumission du formulaire
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault(); // Empêche l'envoi par défaut du formulaire

            const botCheck = contactForm.querySelector('input[name="_gotcha"]')?.value;
            if (botCheck) { // Si le champ honeypot est rempli, c'est un bot
                console.log("Bot detected (honeypot filled). Form submission blocked.");
                return;
            }

            const clientName = contactForm.querySelector('#full-name')?.value || "";
            const clientEmail = contactForm.querySelector('#email-address')?.value || "";
            const whatsappInput = contactForm.querySelector('#whatsapp-number');
            const whatsappNumber = whatsappInput?.value || "";
            const message = contactForm.querySelector('#message')?.value || "";
            const statusElement = contactForm.querySelector("#form-status");

            // Validation Email (RegEx standard)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(clientEmail)) {
                statusElement.innerHTML = "❌ Veuillez entrer une adresse email valide.";
                statusElement.style.color = "#ef4444";
                statusElement.style.display = "block";
                return;
            }

            // Validation Téléphone International (E.164)
            // Autorise le format avec ou sans +, suivi de 7 à 15 chiffres.
            const phoneClean = whatsappNumber.replace(/[\s\-]/g, '');
            const phoneRegex = /^\+?[1-9]\d{6,14}$/;
            if (whatsappNumber.trim() !== "" && !phoneRegex.test(phoneClean)) {
                statusElement.innerHTML = "❌ Format téléphone invalide. Utilisez le format international (ex: +229...)";
                statusElement.style.color = "#ef4444";
                statusElement.style.display = "block";
                return;
            }

            const formType = contactForm.dataset.formType; // Récupère le type de formulaire
            let subject = "Nouveau Message";
            let body = "";
            let website = formType === "audit" ? (contactForm.querySelector('#website')?.value || "") : "";

            // Animation du bouton pendant l'envoi
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: clientName,
                    email: clientEmail,
                    whatsapp: whatsappNumber,
                    message: message,
                    formType: formType,
                    website: website
                })
            })
                .then(response => {
                    if (response.ok) {
                        statusElement.innerHTML = "✅ Message envoyé avec succès ! Vérifiez votre boîte mail.";
                        statusElement.style.color = "#356646";
                        contactForm.reset();
                    } else {
                        throw new Error();
                    }
                })
                .catch(() => {
                    statusElement.innerHTML = "⚠️ Une erreur est survenue, mais un mail d'explication vous a été envoyé.";
                    statusElement.style.color = "#ef4444";
                })
                .finally(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                    statusElement.style.display = "block";
                });

        });
    });

    // 5. Fonctions spécifiques à index.html (carousel, tabs, modal)
    let currentProject = 0;
    // Rendre les fonctions globales pour les appels onclick dans le HTML
    window.moveCarousel = function (direction) {
        const track = document.getElementById('carouselTrack');
        const cards = document.querySelectorAll('.project-card');
        if (!track || cards.length === 0) return;

        currentProject = (currentProject + direction + cards.length) % cards.length;

        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentProject);
        });

        const cardWidth = cards[0].offsetWidth;
        const gap = 15;
        const offset = currentProject * -(cardWidth + gap);
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    window.switchTab = function (tabId, event) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

        event.currentTarget.classList.add('active');
        document.getElementById(tabId).classList.add('active');
    }

    window.scrollToCertificate = function () {
        const tab = document.querySelector('.tab[onclick*="profil"]');
        if (tab) {
            window.switchTab('profil', { currentTarget: tab });
            setTimeout(() => {
                document.getElementById('certificat-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }

    window.openModal = function (src) {
        const modal = document.getElementById('certModal');
        const modalImg = document.getElementById('imgModal');
        if (modal && modalImg) {
            modal.style.display = "flex";
            modalImg.src = src;
        }
    }

    window.closeModal = function () {
        const modal = document.getElementById('certModal');
        if (modal) {
            modal.style.display = "none";
        }
>>>>>>> 73c99ac (feat: ajustement des couleurs SVG pour thème sombre et correction App.jsx)
    }
});