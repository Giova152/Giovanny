import nodemailer from 'nodemailer';

// Configuration du transporteur SMTP (ex: Gmail, Outlook, Hostinger)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === "465", // true pour 465, false pour les autres ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export default async function handler(req, res) {
    // On n'autorise que les requêtes POST (celles envoyées par ton formulaire)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Vérification et parsing du corps de la requête
    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch (e) {
            return res.status(400).json({ error: "Format de données invalide" });
        }
    }

    // Extraction des données
    const { name, email, whatsapp, message, formType = 'contact', website, _gotcha, lang = 'fr' } = body || {};

    // Sécurité Honeypot
    if (_gotcha) {
        return res.status(400).json({ error: 'Bot detected' });
    }

    // Vérification de la configuration SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(500).json({ error: "La configuration SMTP est manquante dans Vercel." });
    }

    const isEN = lang === 'en';

    const serviceLabels = isEN ? {
        'tunnel': 'High-Converting Sales Funnels',
        'audit': 'Audit & Digital Strategy',
        'creation-site': 'Website Development'
    } : {
        'tunnel': 'Tunnels de vente Haute Conversion',
        'audit': 'Audit & Stratégie Digitale',
        'creation-site': 'Développement Site Web'
    };
    const serviceLabel = serviceLabels[formType] || (isEN ? 'inquiry' : 'demande');

    const texts = {
        notif: {
            subject: isEN ? `[${formType.toUpperCase()}] New message from ${name || 'Unknown'}` : `[${formType.toUpperCase()}] Nouveau message de ${name || 'Inconnu'}`,
            title: isEN ? `New contact: ${formType}` : `Nouveau contact : ${formType}`,
            name: isEN ? 'Name' : 'Nom',
            not_given: isEN ? 'Not provided' : 'Non renseigné',
            email_label: isEN ? 'Client Email' : 'Email du client',
            whatsapp_label: isEN ? 'WhatsApp' : 'WhatsApp',
            website_label: isEN ? 'Website to audit' : 'Site à auditer',
            message_label: isEN ? 'Message' : 'Message',
            no_message: isEN ? 'No message provided.' : 'Aucun message fourni.',
        },
        confirm: {
            subject_prefix: isEN ? 'Confirmation of your' : 'Confirmation de votre',
            thank_you: isEN ? `Thank you ${name}!` : `Merci ${name} !`,
            received: isEN ? `I have received your message regarding <strong>${serviceLabel}</strong>.` : `J'ai bien reçu votre message concernant <strong>${serviceLabel}</strong>.`,
            reply_time: isEN ? 'I will get back to you as soon as possible (usually within 24h).' : 'Je vous répondrai dans les plus brefs délais (généralement sous 24h).',
            extra_info: isEN ? 'If you have any additional information, simply reply to this email.' : "Si vous avez des informations supplémentaires à ajouter, répondez simplement à cet email.",
            goodbye: isEN ? 'Looking forward to working with you,' : 'À très bientôt,',
            signature: isEN ? 'Giovanny Gandonou' : 'Giovanny Gandonou',
        }
    };

    try {
        const mailOptions = {
            from: `"Contact InfosWeb" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
            replyTo: email,
            subject: texts.notif.subject,
            html: `
                <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #333; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e8edeb; border-radius: 16px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 28px 24px;">
                        <h2 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 600;">${texts.notif.title}</h2>
                    </div>
                    <div style="padding: 28px 24px;">
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.6;">
                            <tr><td style="padding: 8px 0; color: #6b7280; width: 120px; vertical-align: top;">👤 ${texts.notif.name}</td><td style="padding: 8px 0; font-weight: 500;">${name || texts.notif.not_given}</td></tr>
                            <tr><td style="padding: 8px 0; color: #6b7280; width: 120px; vertical-align: top;">📧 ${texts.notif.email_label}</td><td style="padding: 8px 0; font-weight: 500;">${email || texts.notif.not_given}</td></tr>
                            <tr><td style="padding: 8px 0; color: #6b7280; width: 120px; vertical-align: top;">📱 ${texts.notif.whatsapp_label}</td><td style="padding: 8px 0; font-weight: 500;">${whatsapp || texts.notif.not_given}</td></tr>
                            ${website ? `<tr><td style="padding: 8px 0; color: #6b7280; width: 120px; vertical-align: top;">🌐 ${texts.notif.website_label}</td><td style="padding: 8px 0;"><a href="${website}" style="color: #2d6a4f; font-weight: 500;">${website}</a></td></tr>` : ''}
                        </table>
                        <hr style="border: none; border-top: 2px solid #f0f4f1; margin: 20px 0;">
                        <p style="font-size: 13px; color: #6b7280; margin: 0 0 8px 0; font-weight: 600;">${texts.notif.message_label}</p>
                        <div style="background: #f8faf9; padding: 16px; border-radius: 10px; white-space: pre-wrap; font-style: italic; color: #374151; font-size: 14px; line-height: 1.6; border-left: 3px solid #2d6a4f;">${message || texts.notif.no_message}</div>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        if (email) {
            const confirmOptions = {
                from: `"Giovanny Gandonou" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `${texts.confirm.subject_prefix} ${serviceLabel}`,
                html: `
                    <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #333; max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e8edeb; border-radius: 16px; overflow: hidden;">
                        <div style="background: linear-gradient(135deg, #2d6a4f, #40916c); padding: 32px 28px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.3px;">${texts.confirm.thank_you}</h1>
                        </div>
                        <div style="padding: 32px 28px;">
                            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">${texts.confirm.received}</p>
                            <p style="font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">${texts.confirm.reply_time}</p>
                            <hr style="border: none; border-top: 2px solid #f0f4f1; margin: 0 0 20px 0;">
                            <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin: 0 0 6px 0;">${texts.confirm.extra_info}</p>
                            <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin: 0;">${texts.confirm.goodbye}<br><strong style="color: #2d6a4f;">${texts.confirm.signature}</strong></p>
                        </div>
                        <div style="background: #f8faf9; padding: 20px 28px; text-align: center; border-top: 1px solid #e8edeb;">
                            <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0;">infosweb.io</p>
                            <div style="display: flex; justify-content: center; gap: 8px;">
                                <a href="https://www.facebook.com/Midogiova229" style="display: inline-block; padding: 6px 14px; background: #e8edeb; border-radius: 20px; text-decoration: none; color: #374151; font-size: 12px; font-weight: 500;" target="_blank">Facebook</a>
                                <a href="https://www.linkedin.com/in/midogiova/" style="display: inline-block; padding: 6px 14px; background: #e8edeb; border-radius: 20px; text-decoration: none; color: #374151; font-size: 12px; font-weight: 500;" target="_blank">LinkedIn</a>
                                <a href="https://wa.me/2290198054347" style="display: inline-block; padding: 6px 14px; background: #25d366; border-radius: 20px; text-decoration: none; color: #fff; font-size: 12px; font-weight: 500;" target="_blank">WhatsApp</a>
                            </div>
                        </div>
                    </div>
                `,
            };

            try {
                await transporter.sendMail(confirmOptions);
            } catch (confirmErr) {
                console.error("Erreur envoi confirmation client:", confirmErr);
            }
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur SMTP:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
