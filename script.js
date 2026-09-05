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

    window.track = function(event, params) {
        try {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({ event, ...(params || {}) });
        } catch (e) {
            console.warn('Tracking error:', e);
        }
    };
    const track = window.track;

    function showBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', i18n.t('cookie.title'));
        banner.innerHTML = `
            <div class="cookie-head">
                <i class="fas fa-cookie-bite"></i>
                <span class="cookie-title">${i18n.t('cookie.title')}</span>
            </div>
            <p>${i18n.t('cookie.text')} <a href="/politique-de-confidentialite.html">${i18n.t('cookie.link')}</a></p>
            <div class="cookie-btns">
                <button class="cookie-btn decline" id="cookie-decline">${i18n.t('cookie.decline')}</button>
                <button class="cookie-btn accept" id="cookie-accept">${i18n.t('cookie.accept')}</button>
            </div>
        `;
        document.body.appendChild(banner);
        banner.style.display = 'flex';
        banner.querySelector('#cookie-accept').focus();

        const close = (consent) => {
            setCookie(COOKIE_NAME, consent, 365);
            banner.remove();
            document.removeEventListener('keydown', onKey);
            if (consent === 'accepted') loadGTM();
        };

        function onKey(e) {
            if (e.key === 'Escape') close('declined');
        }

        banner.querySelector('#cookie-accept').addEventListener('click', () => close('accepted'));
        banner.querySelector('#cookie-decline').addEventListener('click', () => close('declined'));
        document.addEventListener('keydown', onKey);
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
            banner.setAttribute('aria-label', i18n.t('cookie.title'));
            banner.querySelector('.cookie-title').textContent = i18n.t('cookie.title');
            banner.querySelector('p').innerHTML = `${i18n.t('cookie.text')} <a href="/politique-de-confidentialite.html">${i18n.t('cookie.link')}</a>`;
            banner.querySelector('#cookie-accept').textContent = i18n.t('cookie.accept');
            banner.querySelector('#cookie-decline').textContent = i18n.t('cookie.decline');
        }
    });
})();

document.addEventListener("DOMContentLoaded", function () {
    const track = (event, params) => {
        if (typeof window.track === 'function') {
            window.track(event, params);
        }
    };

    const user = "midogiova";
    const domain = "outlook.com";
    const email = `${user}@${domain}`;

    const contactLinks = document.querySelectorAll('[id^="contact-link"], .js-obfuscated-email, .mailto-link');
    contactLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const subject = encodeURIComponent(window.i18n && window.i18n.lang === 'en' ? 'Discuss a project' : "Discuter d'un projet");
            window.location.href = `mailto:${email}?subject=${subject}`;
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
            const phoneNumber = data.phone || data.whatsapp || "";
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

            if (message.trim().length < 40) {
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
            if (phoneNumber.trim() !== "") {
                const phoneClean = phoneNumber.replace(/[\s\-\(\)]/g, '');
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
                phone: phoneNumber,
                whatsapp: phoneNumber,
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
                        track('form_submit', { form: formType });
                        if (statusElement) {
                            statusElement.innerHTML = "✅ " + i18n.t('form.success');
                            statusElement.style.color = "#356646";
                        }
                        contactForm.reset();
                        setTimeout(() => {
                            window.location.href = window.location.pathname.startsWith('/en/') ? '/en/merci.html' : '/merci.html';
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
        const carouselTrack = document.getElementById('carouselTrack');
        const cards = document.querySelectorAll('.project-card');
        const dots = document.querySelectorAll('.dot');
        if (!carouselTrack || cards.length === 0) return;

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
        carouselTrack.style.transform = `translate3d(${offset}px, 0, 0)`;
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

    const carouselTrack = document.getElementById('carouselTrack');
    let touchStartX = 0;
    let touchEndX = 0;

    if (carouselTrack) {
        carouselTrack.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carouselTrack.addEventListener('touchend', e => {
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
            section.querySelectorAll('.service-card').forEach(card => card.classList.add('visible'));
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

    const serviceCards = document.querySelectorAll('.service-card');
    if (serviceCards.length > 0 && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });
        serviceCards.forEach(card => observer.observe(card));
    } else {
        serviceCards.forEach(card => card.classList.add('visible'));
    }

    window.toggleService = function (accordionEl) {
        const wasOpen = accordionEl.classList.contains('open');
        document.querySelectorAll('.service-accordion').forEach(el => el.classList.remove('open'));
        if (!wasOpen) {
            accordionEl.classList.add('open');
        }
    };

    window.openServiceModal = function (serviceKey, serviceName) {
        const modal = document.getElementById('projectModal');
        if (!modal) return;
        const typeInput = document.getElementById('modalFormType');
        const nameInput = document.getElementById('modalServiceName');
        const badge = document.getElementById('modalServiceBadge');
        if (typeInput) typeInput.value = serviceKey || 'contact';
        if (nameInput) nameInput.value = serviceName || 'Projet';
        if (badge) badge.textContent = serviceName || ((typeof i18n !== 'undefined' && i18n.lang === 'en') ? 'Project' : 'Projet');

        const status = document.getElementById('modalFormStatus');
        if (status) {
            status.className = 'modal-form-status';
            status.style.display = 'none';
            status.textContent = '';
        }
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const firstInput = document.getElementById('modalClientName');
            if (firstInput) firstInput.focus();
        }, 100);
        track('modal_open', { service: serviceName });
    };

    window.closeServiceModal = function (e) {
        if (e && e.target && e.target.id !== 'projectModal' && !e.target.classList.contains('project-modal-close')) {
            return;
        }
        const modal = document.getElementById('projectModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    const projectModalForm = document.getElementById('projectModalForm');
    if (projectModalForm) {
        projectModalForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const statusEl = document.getElementById('modalFormStatus');
            const submitBtn = document.getElementById('modalSubmitBtn');
            const name = document.getElementById('modalClientName')?.value.trim() || '';
            const email = document.getElementById('modalClientEmail')?.value.trim() || '';
            const phone = document.getElementById('modalClientPhone')?.value.trim() || '';
            const message = document.getElementById('modalClientMessage')?.value.trim() || '';
            const formType = document.getElementById('modalFormType')?.value || 'contact';
            const serviceName = document.getElementById('modalServiceName')?.value || 'Projet';
            const bot = projectModalForm.querySelector('input[name="_gotcha"]')?.value;

            if (bot) return;

            const isEN = (typeof i18n !== 'undefined' && i18n.lang === 'en') || window.location.pathname.includes('/en/');

            if (name.length < 2) {
                if (statusEl) {
                    statusEl.className = 'modal-form-status error';
                    statusEl.textContent = isEN ? 'Please enter your name.' : 'Veuillez entrer votre nom.';
                }
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (statusEl) {
                    statusEl.className = 'modal-form-status error';
                    statusEl.textContent = isEN ? 'Please enter a valid email address.' : 'Veuillez entrer une adresse email valide.';
                }
                return;
            }

            if (message.length < 10) {
                if (statusEl) {
                    statusEl.className = 'modal-form-status error';
                    statusEl.textContent = isEN ? 'Please briefly describe your project (at least 10 characters).' : 'Veuillez décrire brièvement votre besoin (au moins 10 caractères).';
                }
                return;
            }

            const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${isEN ? 'Sending...' : 'Envoi en cours...'}`;
            }

            try {
                const res = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        phone,
                        message,
                        formType,
                        lang: isEN ? 'en' : 'fr'
                    })
                });

                if (res.ok) {
                    if (statusEl) {
                        statusEl.className = 'modal-form-status success';
                        statusEl.innerHTML = `<i class="fas fa-check-circle"></i> ${isEN ? 'Request sent successfully! I will get back to you within 24 hours.' : 'Demande envoyée avec succès ! Je reviens vers vous sous 24h.'}`;
                    }
                    track('form_submit', { form: 'service_modal', service: serviceName });
                    projectModalForm.reset();
                    setTimeout(() => {
                        window.closeServiceModal();
                        if (statusEl) {
                            statusEl.className = 'modal-form-status';
                            statusEl.style.display = 'none';
                            statusEl.textContent = '';
                        }
                    }, 2800);
                } else {
                    let errMessage = 'Erreur serveur';
                    try {
                        const data = await res.json();
                        if (data && data.error) errMessage = data.error;
                    } catch (e) {}
                    throw new Error(errMessage);
                }
            } catch (err) {
                console.error("Erreur d'envoi du formulaire modal:", err);
                if (statusEl) {
                    statusEl.className = 'modal-form-status error';
                    statusEl.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${isEN ? 'An error occurred while sending. Please check your connection and try again.' : 'Une erreur est survenue lors de l’envoi. Veuillez vérifier votre connexion et réessayer.'}`;
                }
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHtml;
                }
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.closeServiceModal();
        }
    });

    document.addEventListener('click', (e) => {
        const serviceCta = e.target.closest('.js-service-cta');
        if (serviceCta) {
            e.preventDefault();
            e.stopPropagation();
            const serviceKey = serviceCta.dataset.serviceKey || 'contact';
            const serviceName = serviceCta.dataset.service || 'Projet';
            openServiceModal(serviceKey, serviceName);
            return;
        }

        const cta = e.target.closest('.main-cta, .service-accordion, .social');
        if (cta && !cta.classList.contains('js-main-contact-cta')) track('cta_click', { cta: cta.classList[0] });
    });

    const langToggle = document.querySelector('.lang-toggle');
    if (langToggle) {
        langToggle.addEventListener('click', (e) => {
            const isCurrentlyFr = (typeof i18n !== 'undefined' && i18n.lang === 'fr') || !window.location.pathname.includes('/en/');
            const targetLang = isCurrentlyFr ? 'en' : 'fr';
            try {
                localStorage.setItem('giova_lang', targetLang);
            } catch (_) {}
            track('lang_switch', { lang: targetLang });
            if (window.location.protocol === 'file:') {
                e.preventDefault();
                const href = langToggle.getAttribute('href') || '';
                const path = window.location.pathname;
                let basePath = path;
                if (basePath.includes('/en/')) {
                    basePath = basePath.substring(0, basePath.indexOf('/en/') + 1);
                } else {
                    const subdirs = ['/tunnel-de-vente/', '/creation-site-web/', '/audit-strategie/', '/automatisation-crm/'];
                    const found = subdirs.find(s => basePath.includes(s));
                    if (found) {
                        basePath = basePath.substring(0, basePath.indexOf(found) + 1);
                    } else {
                        basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
                    }
                }
                let target = href.startsWith('/') ? href.slice(1) : href;
                if (target === '' || target.endsWith('/')) target += 'index.html';
                window.location.href = basePath + target;
            }
        });
    }
});