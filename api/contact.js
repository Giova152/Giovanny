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
                <div style="font-family: sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #356646;">${texts.notif.title}</h2>
                    <p><strong>👤 ${texts.notif.name} :</strong> ${name || texts.notif.not_given}</p>
                    <p><strong>📧 ${texts.notif.email_label} :</strong> ${email || texts.notif.not_given}</p>
                    <p><strong>📱 ${texts.notif.whatsapp_label} :</strong> ${whatsapp || texts.notif.not_given}</p>
                    ${website ? `<p><strong>🌐 ${texts.notif.website_label} :</strong> <a href="${website}">${website}</a></p>` : ''}
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p><strong>${texts.notif.message_label} :</strong></p>
                    <div style="background: #f4f7f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-style: italic;">${message || texts.notif.no_message}</div>
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
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #356646;">${texts.confirm.thank_you}</h2>
                        <p>${texts.confirm.received}</p>
                        <p>${texts.confirm.reply_time}</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 13px; color: #888;">${texts.confirm.extra_info}</p>
                        <p style="font-size: 13px; color: #888;">${texts.confirm.goodbye}<br><strong>${texts.confirm.signature}</strong></p>
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
