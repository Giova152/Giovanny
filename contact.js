import { Resend } from 'resend';
import twilio from 'twilio';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Méthode non autorisée' });
    }

    const { name, email, whatsapp, message, formType, website } = req.body;

    try {
        // 1. Tentative d'envoi de l'email à Giovanny (Propriétaire)
        const ownerEmail = await resend.emails.send({
            from: 'Portfolio <onboarding@resend.dev>',
            to: 'midogiova@gmail.com',
            subject: `🚀 Nouveau projet : ${formType}`,
            html: `
        <h2>Nouveau message de ${name}</h2>
        <p><strong>Email :</strong> ${email}</p>
        <p><strong>WhatsApp :</strong> ${whatsapp || 'Non précisé'}</p>
        ${website ? `<p><strong>Site :</strong> ${website}</p>` : ''}
        <p><strong>Type :</strong> ${formType}</p>
        <p><strong>Message :</strong></p>
        <blockquote style="border-left: 4px solid #356646; padding-left: 10px;">${message}</blockquote>
      `
        });

        if (ownerEmail.error) throw new Error('Owner email failed');

        // 1b. Notification SMS à Giovanny
        try {
            await twilioClient.messages.create({
                body: `🚀 Nouveau projet [${formType}] de ${name}. WhatsApp: ${whatsapp || 'Non précisé'}. Message: ${message.substring(0, 100)}...`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: '+2290198054347'
            });
        } catch (smsError) {
            console.error('Échec envoi SMS Twilio:', smsError);
        }

        // 2. Si succès -> Envoyer mail de confirmation de succès à l'utilisateur
        await resend.emails.send({
            from: 'Giovanny Gandonou <onboarding@resend.dev>',
            to: email,
            subject: 'Confirmation de réception - Giovanny Gandonou',
            html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f7f6; padding: 40px 0; margin: 0; width: 100%;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            <!-- Header -->
            <tr>
              <td style="background-color: #356646; padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Giovanny Gandonou</h1>
                <p style="color: #e6ece8; margin: 5px 0 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Consultant Tunnels & Web</p>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding: 40px 30px;">
                <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Bonjour ${name},</h2>
                <p style="color: #555555; line-height: 1.6; font-size: 16px;">
                  Merci de m'avoir contacté ! J'ai bien reçu votre demande concernant votre projet de <strong>${formType}</strong>.
                </p>
                <div style="background-color: #f0f4f1; border-left: 4px solid #356646; padding: 20px; margin: 25px 0;">
                  <p style="color: #356646; margin: 0; font-weight: 600; font-size: 15px;">
                    🚀 Prochaine étape :
                  </p>
                  <p style="color: #555555; margin: 5px 0 0; font-size: 14px;">
                    J'analyse actuellement vos informations. Je reviendrai vers vous par email ou via WhatsApp sous <strong>24h à 48h</strong> pour discuter des détails.
                  </p>
                </div>
                <p style="color: #555555; line-height: 1.6; font-size: 16px;">À très vite pour propulser votre business,</p>
                <p style="margin-bottom: 0;"><strong>Giovanny Gandonou</strong></p>
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background-color: #f9fbf9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
                <p style="color: #999999; font-size: 12px; margin: 0;">
                  Cotonou, Bénin • <a href="https://infosweb.io" style="color: #356646; text-decoration: none;">infosweb.io</a>
                </p>
              </td>
            </tr>
          </table>
        </div>
      `
        });

        return res.status(200).json({ success: true });

    } catch (error) {
        console.error('Erreur envoi:', error);

        // 3. En cas d'échec de l'envoi à Giovanny -> Envoyer mail d'alerte/échec à l'utilisateur
        try {
            await resend.emails.send({
                from: 'Support Portfolio <onboarding@resend.dev>',
                to: email,
                subject: '⚠️ Erreur lors de l\'envoi de votre demande',
                html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2>Désolé ${name},</h2>
            <p>Une erreur technique est survenue et votre message n'a pas pu m'être transmis automatiquement.</p>
            <p><strong>Pas de panique !</strong> Vous pouvez me contacter directement en répondant à ce mail ou par WhatsApp au +229 01 98 05 43 47.</p>
            <p>Veuillez m'excuser pour ce petit contretemps.</p>
          </div>
        `
            });
        } catch (e) {
            // Si même le mail d'échec échoue, on log l'erreur
            console.error('Email d\'échec impossible à envoyer');
        }

        return res.status(500).json({ error: 'Échec de la transmission' });
    }
}