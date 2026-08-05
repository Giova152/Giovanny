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

            function showError(msg) {
                if (statusElement) {
                    statusElement.innerHTML = "❌ " + msg;
                    statusElement.style.color = "#ef4444";
                    statusElement.style.display = "block";
                }
            }

            if (clientName.trim().length < 3) {
                showError(i18n.t('form.name_min'));
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.([a-zA-Z]{2,})$/;
            if (!emailRegex.test(clientEmail)) {
                showError(i18n.t('form.email_invalid'));
                return;
            }
            const commonDomains = ['gmail.com','yahoo.com','hotmail.com','outlook.com','icloud.com','protonmail.com','live.com'];
            const emailDomain = clientEmail.split('@')[1].toLowerCase();
            const domainTypos = {'gmai.com':'gmail.com','gmal.com':'gmail.com','gnail.com':'gmail.com','yaho.com':'yahoo.com','hotmal.com':'hotmail.com','outlok.com':'outlook.com','hotmial.com':'hotmail.com','yhoo.com':'yahoo.com','icloud.co':'icloud.com','protonmal.com':'protonmail.com'};
            if (domainTypos[emailDomain]) {
                showError("Email : vouliez-vous dire @" + domainTypos[emailDomain] + " ?");
                return;
            }

            if (message.trim().length < 100) {
                showError(i18n.t('form.message_min'));
                return;
            }

            const countryPhoneMap = {
                '+229': {len:8,name:'Bénin'},'+33':{len:9,name:'France'},'+1':{len:10,name:'US/Canada'},
                '+221':{len:9,name:'Sénégal'},'+225':{len:10,name:'Côte d\'Ivoire'},'+227':{len:8,name:'Niger'},
                '+226':{len:8,name:'Burkina Faso'},'+228':{len:8,name:'Togo'},'+237':{len:9,name:'Cameroun'},
                '+243':{len:9,name:'RDC'},'+242':{len:9,name:'Congo'},'+241':{len:8,name:'Gabon'},
                '+224':{len:9,name:'Guinée'},'+223':{len:8,name:'Mali'},'+44':{len:10,name:'UK'},
                '+49':{len:11,name:'Germany'},'+32':{len:9,name:'Belgium'},'+41':{len:9,name:'Switzerland'},
                '+31':{len:9,name:'Netherlands'},'+34':{len:9,name:'Spain'},'+39':{len:10,name:'Italy'},
                '+351':{len:9,name:'Portugal'},'+46':{len:9,name:'Sweden'},'+47':{len:8,name:'Norway'},
                '+45':{len:8,name:'Denmark'},'+358':{len:9,name:'Finland'},'+43':{len:10,name:'Austria'},
                '+7':{len:10,name:'Russia'},'+86':{len:11,name:'China'},'+81':{len:10,name:'Japan'},
                '+82':{len:10,name:'South Korea'},'+91':{len:10,name:'India'},'+55':{len:11,name:'Brazil'},
                '+52':{len:10,name:'Mexico'},'+54':{len:10,name:'Argentina'},'+56':{len:9,name:'Chile'},
                '+57':{len:10,name:'Colombia'},'+51':{len:9,name:'Peru'},'+234':{len:10,name:'Nigeria'},
                '+233':{len:9,name:'Ghana'},'+254':{len:9,name:'Kenya'},'+212':{len:9,name:'Morocco'},
                '+216':{len:8,name:'Tunisia'},'+213':{len:9,name:'Algeria'},'+20':{len:10,name:'Egypt'},
                '+971':{len:9,name:'UAE'},'+966':{len:9,name:'Saudi Arabia'},'+65':{len:8,name:'Singapore'},
                '+60':{len:9,name:'Malaysia'},'+62':{len:10,name:'Indonesia'},'+63':{len:10,name:'Philippines'},
                '+84':{len:9,name:'Vietnam'},'+66':{len:9,name:'Thailand'},'+90':{len:10,name:'Turkey'},
                '+48':{len:9,name:'Poland'},'+36':{len:9,name:'Hungary'},'+420':{len:9,name:'Czech Republic'},
                '+40':{len:9,name:'Romania'},'+30':{len:10,name:'Greece'},'+353':{len:9,name:'Ireland'},
                '+27':{len:9,name:'South Africa'},
            };
            if (whatsappNumber.trim() !== "") {
                const phoneClean = whatsappNumber.replace(/[\s\-\(\)]/g, '');
                const phoneRegex = /^\+[1-9]\d{6,14}$/;
                if (!phoneRegex.test(phoneClean)) {
                    showError(i18n.t('form.phone_invalid'));
                    return;
                }
                let matched = false;
                for (const prefix in countryPhoneMap) {
                    if (phoneClean.startsWith(prefix)) {
                        const digits = phoneClean.slice(prefix.length);
                        const expected = countryPhoneMap[prefix];
                        if (digits.length === expected.len) {
                            matched = true;
                            break;
                        } else {
                            showError("Le numéro " + prefix + " doit avoir " + expected.len + " chiffres (ex: " + prefix + " XX XX XX XX)");
                            return;
                        }
                    }
                }
                if (!matched) {
                    const digitsAfterPlus = phoneClean.slice(1).length;
                    if (digitsAfterPlus < 7 || digitsAfterPlus > 15) {
                        showError(i18n.t('form.phone_invalid'));
                        return;
                    }
                }
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