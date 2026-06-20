(function() {
    const COOKIE_NAME = 'cookie_consent';
    const GTM_ID = 'GTM-MM6839JT';

    function getCookie(name) {
        return document.cookie.split('; ').find(r => r.startsWith(name + '='));
    }

    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + days * 86400000);
        document.cookie = name + '=' + value + ';path=/;expires=' + d.toUTCString() + ';SameSite=Lax';
    }

    function loadGTM() {
        if (window.gtmLoaded) return;
        window.gtmLoaded = true;
        (function(w,d,s,l,i){
            w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});
            var f=d.getElementsByTagName(s)[0], j=d.createElement(s), dl=l!='dataLayer'?'&l='+l:'';
            j.async=true; j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
            f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer',GTM_ID);
    }

    function showBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.innerHTML = `
            <p>${i18n.t('cookie.text')} <a href="/politique-de-confidentialite.html">${i18n.t('cookie.link')}</a></p>
            <div class="cookie-btns">
                <button class="cookie-btn decline" id="cookie-decline">${i18n.t('cookie.decline')}</button>
                <button class="cookie-btn accept" id="cookie-accept">${i18n.t('cookie.accept')}</button>
            </div>
        `;
        document.body.appendChild(banner);
        banner.style.display = 'flex';

        document.getElementById('cookie-accept').addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'accepted', 365);
            banner.style.display = 'none';
            loadGTM();
        });

        document.getElementById('cookie-decline').addEventListener('click', function() {
            setCookie(COOKIE_NAME, 'declined', 365);
            banner.style.display = 'none';
        });
    }

    function getStatusText(key) {
        return i18n.t(key);
    }

    function applyI18nToFormStatus() {
        document.querySelectorAll("#form-status").forEach(el => {
            if (el.dataset.i18nKey) {
                el.innerHTML = getStatusText(el.dataset.i18nKey);
            }
        });
    }

    const existing = getCookie(COOKIE_NAME);
    if (!existing) {
        const initBanner = () => showBanner();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initBanner);
        } else {
            initBanner();
        }
    } else if (existing.includes('accepted')) {
        loadGTM();
    }

    document.addEventListener('langchange', function() {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
            banner.querySelector('p').innerHTML = `${i18n.t('cookie.text')} <a href="/politique-de-confidentialite.html">${i18n.t('cookie.link')}</a>`;
            document.getElementById('cookie-accept').textContent = i18n.t('cookie.accept');
            document.getElementById('cookie-decline').textContent = i18n.t('cookie.decline');
        }
    });
})();

document.addEventListener("DOMContentLoaded", function () {
    const user = "midogiova";
    const domain = "gmail.com";
    const email = `${user}@${domain}`;

    const contactLinks = document.querySelectorAll('[id^="contact-link"], .js-obfuscated-email, .mailto-link');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = `mailto:${email}`;
        });
    });

    const copyBtn = document.getElementById('copy-email-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            navigator.clipboard.writeText(email).then(() => {
                const originalText = this.innerHTML;
                this.innerText = i18n.t('email.copied');
                this.style.color = "#22c55e";
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.style.color = "";
                }, 2000);
            });
        });
    }

    document.querySelectorAll(".contact-form").forEach(contactForm => {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });

            const botValue = data._gotcha || "";
            if (botValue) {
                console.log("Bot detected. Submission blocked.");
                return;
            }

            const clientName = data.name || "";
            const clientEmail = data.email || data._replyto || "";
            const whatsappNumber = data.whatsapp || "";
            const message = data.message || "";
            const website = data.website || "";
            const statusElement = contactForm.querySelector("#form-status");

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(clientEmail)) {
                if (statusElement) {
                    statusElement.innerHTML = "❌ " + i18n.t('form.email_invalid');
                    statusElement.style.color = "#ef4444";
                    statusElement.style.display = "block";
                }
                return;
            }

            const phoneClean = whatsappNumber.replace(/[\s\-]/g, '');
            const phoneRegex = /^\+?[1-9]\d{6,14}$/;
            if (whatsappNumber.trim() !== "" && !phoneRegex.test(phoneClean)) {
                if (statusElement) {
                    statusElement.innerHTML = "❌ " + i18n.t('form.phone_invalid');
                    statusElement.style.color = "#ef4444";
                    statusElement.style.display = "block";
                }
                return;
            }

            const formType = contactForm.dataset.formType;

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            let originalBtnText = "";
            if (submitBtn) {
                originalBtnText = submitBtn.innerHTML;
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + i18n.t('form.sending');
            }

            const payload = {
                name: clientName,
                email: clientEmail,
                whatsapp: whatsappNumber,
                message: message,
                formType: formType,
                website: website,
                lang: i18n.lang,
                _gotcha: botValue
            };

            fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(response => {
                    if (response.ok) {
                        if (statusElement) {
                            statusElement.innerHTML = "✅ " + i18n.t('form.success');
                            statusElement.style.color = "#356646";
                        }
                        contactForm.reset();
                        setTimeout(() => {
                            window.location.href = "/merci.html";
                        }, 1500);
                    } else {
                        return response.text().then(text => {
                            console.warn("Réponse brute du serveur:", text);
                            let errorMessage = "Erreur serveur";
                            try {
                                const data = JSON.parse(text);
                                errorMessage = data.error || errorMessage;
                            } catch (e) {}
                            throw new Error(errorMessage);
                        });
                    }
                })
                .catch((error) => {
                    console.error("Erreur lors de la soumission:", error);
                    if (statusElement) {
                        statusElement.innerHTML = "⚠️ " + i18n.t('form.error');
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

    let currentProject = 0;
    window.moveCarousel = function (direction) {
        const track = document.getElementById('carouselTrack');
        const cards = document.querySelectorAll('.project-card');
        const dots = document.querySelectorAll('.dot');
        if (!track || cards.length === 0) return;

        currentProject = (currentProject + direction + cards.length) % cards.length;

        cards.forEach((card, index) => {
            card.classList.toggle('active', index === currentProject);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentProject);
        });

        const cardWidth = cards[0].offsetWidth;
        const gap = 15;
        const offset = currentProject * -(cardWidth + gap);
        track.style.transform = `translate3d(${offset}px, 0, 0)`;
    }

    const dotsContainer = document.getElementById('carouselDots');
    const projects = document.querySelectorAll('.project-card');
    if (dotsContainer && projects.length > 0) {
        projects.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                const diff = index - currentProject;
                window.moveCarousel(diff);
            });
            dotsContainer.appendChild(dot);
        });
    }

    const track = document.getElementById('carouselTrack');
    let touchStartX = 0;
    let touchEndX = 0;

    if (track) {
        track.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        track.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        if (touchStartX - touchEndX > swipeThreshold) window.moveCarousel(1);
        if (touchEndX - touchStartX > swipeThreshold) window.moveCarousel(-1);
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
        window.openModal('/images/certificate.webp');
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

    let autoScrollInterval = setInterval(() => {
        if (typeof window.moveCarousel === 'function') window.moveCarousel(1);
    }, 5000);

    const carouselWrapper = document.querySelector('.carousel-wrapper');
    if (carouselWrapper) {
        carouselWrapper.addEventListener('mouseenter', () => clearInterval(autoScrollInterval));
        carouselWrapper.addEventListener('mouseleave', () => {
            autoScrollInterval = setInterval(() => window.moveCarousel(1), 5000);
        });
    }
});