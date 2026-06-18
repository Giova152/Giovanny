import { Resend } from 'resend';

// Initialisation de Resend avec la clé configurée dans les variables d'environnement de Vercel
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
    // On n'autorise que les requêtes POST (celles envoyées par ton formulaire)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    // Extraction des données envoyées par ton script.js
    const { name, email, whatsapp, message, formType, website, _gotcha } = req.body;

    // Sécurité supplémentaire : si le champ caché (honeypot) est rempli, on bloque
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
            subject: `[${formType.toUpperCase()}] Nouveau message de ${name}`,
            html: `
                <div style="font-family: sans-serif; color: #333; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #356646;">Nouveau contact : ${formType}</h2>
                    <p><strong>Nom :</strong> ${name}</p>
                    <p><strong>Email :</strong> ${email}</p>
                    <p><strong>WhatsApp :</strong> ${whatsapp || 'Non renseigné'}</p>
                    ${website ? `<p><strong>Site à auditer :</strong> <a href="${website}">${website}</a></p>` : ''}
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p><strong>Message :</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `,
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error("Erreur Resend:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
