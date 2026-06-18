import { Resend } from 'resend';

// Initialisation de Resend avec la clé configurée dans les variables d'environnement de Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // Vérification que la clé API est bien présente sur Vercel
    if (!process.env.RESEND_API_KEY) {
        return res.status(500).json({ error: "La clé API Resend n'est pas configurée dans Vercel." });
    }

    try {
        await resend.emails.send({
            from: 'Contact InfosWeb <contact@infosweb.io>',
            to: ['midogiova@gmail.com'],
            reply_to: email,
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
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur Resend:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
