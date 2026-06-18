document.addEventListener("DOMContentLoaded", function () {
    // Configuration
    const user = "midogiova";
    const domain = "gmail.com";
    const email = `${user}@${domain}`;

    // 1. Obfuscation des liens mailto
    const contactLinks = document.querySelectorAll('[id^="contact-link"], .js-obfuscated-email, .mailto-link');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `mailto:${email}`;
        });
    });

    // 3. Copie de l'email
    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
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
                if (statusElement) {
                    statusElement.innerHTML = "❌ Veuillez entrer une adresse email valide.";
                    statusElement.style.color = "#ef4444";
                    statusElement.style.display = "block";
                }
                return;
            }

            // Validation Téléphone International (E.164)
            // Autorise le format avec ou sans +, suivi de 7 à 15 chiffres.
            const phoneClean = whatsappNumber.replace(/[\s\-]/g, '');
            const phoneRegex = /^\+?[1-9]\d{6,14}$/;
            if (whatsappNumber.trim() !== "" && !phoneRegex.test(phoneClean)) {
                if (statusElement) {
                    statusElement.innerHTML = "❌ Format téléphone invalide. Utilisez le format international (ex: +229...)";
                    statusElement.style.color = "#ef4444";
                    statusElement.style.display = "block";
                }
                return;
            }

            const formType = contactForm.dataset.formType; // Récupère le type de formulaire
            let subject = "Nouveau Message";
            let body = "";
            let website = formType === "audit" ? (contactForm.querySelector('#website')?.value || "") : "";

            // Animation du bouton pendant l'envoi
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            let originalBtnText = "";
            if (submitBtn) {
                originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
            }

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
                        if (statusElement) {
                            statusElement.innerHTML = "✅ Message envoyé avec succès ! Vérifiez votre boîte mail.";
                            statusElement.style.color = "#356646";
                        }
                        contactForm.reset();
                        setTimeout(() => {
                            window.location.href = "/merci.html";
                        }, 1500);
                    } else {
                        // On récupère le texte d'abord pour éviter l'erreur de parsing JSON si c'est du HTML
                        return response.text().then(text => {
                            // LOG DE DÉBOGAGE : Affiche ce que le serveur a réellement envoyé
                            console.warn("Réponse brute du serveur (non-JSON):", text);
                            let errorMessage = "Erreur serveur";
                            try {
                                const data = JSON.parse(text);
                                errorMessage = data.error || errorMessage;
                            } catch (e) {
                                // Si ce n'est pas du JSON, on reste sur le message par défaut
                            }
                            throw new Error(errorMessage);
                        });
                    }
                })
                .catch((error) => {
                    console.error("Erreur lors de la soumission:", error);
                    if (statusElement) {
                        statusElement.innerHTML = "⚠️ Une erreur est survenue lors de l'envoi. Veuillez réessayer ou me contacter directement.";
                        statusElement.style.color = "#ef4444";
                    }
                })
                .finally(() => {
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalBtnText;
                    }
                    if (statusElement) {
                        statusElement.style.display = "block";
                    }
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
        const section = document.getElementById(tabId);
        if (section) {
            section.classList.add('active');
        }
    }

    window.scrollToCertificate = function () {
        // Ouvre la modale du certificat au lieu de scroller vers une section inexistante
        // Assurez-vous que l'image du certificat est passée à openModal si nécessaire
        // Pour l'instant, on ouvre la modale sans image spécifique, à adapter si tu as une image de certificat
        window.openModal('/images/pl.webp'); // Utilise l'image de ton profil comme exemple
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
    }
});