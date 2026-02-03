const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar transporter de Gmail
// Necesitas crear una "Contraseña de aplicación" en Google:
// 1. Ve a https://myaccount.google.com/apppasswords
// 2. Crea una contraseña para "Otra aplicación" -> "Orion Server"
// 3. Copia la contraseña de 16 caracteres
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || 'gamogestionweb@gmail.com',
    pass: process.env.GMAIL_APP_PASSWORD  // Contraseña de aplicación de Google (NO tu contraseña normal)
  }
});

// Endpoint principal: recibir feedback de usuarios que han pagado
app.post('/feedback', async (req, res) => {
  try {
    const { message, amount, productName, deviceInfo, purchaseToken } = req.body;

    // Validar que hay mensaje y cantidad
    if (!message || !amount) {
      return res.status(400).json({ error: 'Mensaje y cantidad son requeridos' });
    }

    // Formatear el email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a2e; color: #fff; border-radius: 12px;">
        <h1 style="color: #D4AF37; margin-bottom: 20px;">🎉 ¡Nuevo apoyo en Orion!</h1>

        <div style="background: #16213e; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <p style="margin: 0; color: #E8B4B8; font-size: 24px; font-weight: bold;">💰 ${amount}</p>
          <p style="margin: 5px 0 0 0; color: #888;">📦 ${productName || 'Donación'}</p>
        </div>

        <div style="background: #16213e; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: #5B8FB9; margin-top: 0;">💬 Mensaje del usuario:</h3>
          <p style="color: #fff; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>

        <div style="color: #666; font-size: 12px; border-top: 1px solid #333; padding-top: 15px;">
          <p>📱 Dispositivo: ${deviceInfo || 'No especificado'}</p>
          <p>📅 Fecha: ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid' })}</p>
          ${purchaseToken ? `<p>🔑 Token: ${purchaseToken.substring(0, 30)}...</p>` : ''}
        </div>

        <p style="color: #D4AF37; font-style: italic; margin-top: 20px;">
          Este mensaje fue enviado desde Orion App.<br>
          Solo recibes mensajes de usuarios que han apoyado económicamente. 💜
        </p>
      </div>
    `;

    // Enviar email
    await transporter.sendMail({
      from: '"Orion App" <gamogestionweb@gmail.com>',
      to: 'gamogestionweb@gmail.com',
      subject: `💜 Orion: Nuevo apoyo de ${amount} - ${productName || 'Donación'}`,
      html: emailHtml,
      text: `Nuevo apoyo en Orion!\n\nCantidad: ${amount}\nProducto: ${productName}\n\nMensaje:\n${message}\n\nDispositivo: ${deviceInfo}\nFecha: ${new Date().toLocaleString('es-ES')}`
    });

    console.log(`✅ Feedback enviado: ${amount} - ${message.substring(0, 50)}...`);
    res.json({ success: true, message: 'Mensaje enviado correctamente' });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error enviando mensaje' });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Orion Feedback Server',
    message: 'Solo acepto mensajes de quienes apoyan 💜'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Orion Feedback Server en puerto ${PORT}`);
});
