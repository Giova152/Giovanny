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
    const { name, email, whatsapp, message, formType = 'contact', website, _gotcha } = body || {};

    // Sécurité Honeypot
    if (_gotcha) {
        return res.status(400).json({ error: 'Bot detected' });
    }

    // Vérification de la configuration SMTP
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        return res.status(500).json({ error: "La configuration SMTP est manquante dans Vercel." });
    }

    try {
        const mailOptions = {
            from: `"Contact InfosWeb" <${process.env.SMTP_USER}>`,
            to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
            replyTo: email,
            subject: `[${formType.toUpperCase()}] Nouveau message de ${name || 'Inconnu'}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #356646;">Nouveau contact : ${formType}</h2>
                    <p><strong>👤 Nom :</strong> ${name || 'Non renseigné'}</p>
                    <p><strong>📧 Email du client :</strong> ${email || 'Non renseigné'}</p>
                    <p><strong>📱 WhatsApp :</strong> ${whatsapp || 'Non renseigné'}</p>
                    ${website ? `<p><strong>🌐 Site à auditer :</strong> <a href="${website}">${website}</a></p>` : ''}
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p><strong>Message :</strong></p>
                    <div style="background: #f4f7f5; padding: 15px; border-radius: 8px; white-space: pre-wrap; font-style: italic;">${message || 'Aucun message fourni.'}</div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        // Email de confirmation au client
        if (email) {
            const serviceLabels = {
                'tunnel': 'Tunnels de vente Haute Conversion',
                'audit': 'Audit & Stratégie Digitale',
                'creation-site': 'Développement Site Web'
            };
            const serviceLabel = serviceLabels[formType] || 'demande';

            const confirmOptions = {
                from: `"Giovanny Gandonou" <${process.env.SMTP_USER}>`,
                to: email,
                subject: `Confirmation de votre ${serviceLabel}`,
                html: `
                    <div style="font-family: sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #356646;">Merci ${name} !</h2>
                        <p>J'ai bien reçu votre message concernant <strong>${serviceLabel}</strong>.</p>
                        <p>Je vous répondrai dans les plus brefs délais (généralement sous 24h).</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 13px; color: #888;">Si vous avez des informations supplémentaires à ajouter, répondez simplement à cet email.</p>
                        <p style="font-size: 13px; color: #888;">À très bientôt,<br><strong>Giovanny Gandonou</strong></p>
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
