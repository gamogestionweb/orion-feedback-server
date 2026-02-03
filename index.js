const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Configurar transporte de email (usando Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Endpoint de health check
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Orion Feedback Server Running' });
});

// Endpoint principal de feedback
app.post('/feedback', async (req, res) => {
    try {
        const { message, amount, productName, deviceInfo, purchaseToken } = req.body;

        console.log('📩 Nuevo feedback recibido:');
        console.log('- Producto:', productName);
        console.log('- Cantidad:', amount);
        console.log('- Dispositivo:', deviceInfo);
        console.log('- Mensaje:', message);

        // Enviar email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_TO || process.env.EMAIL_USER,
            subject: `💜 Orion Feedback - ${productName} (${amount})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #1a1a24; color: #fff; border-radius: 12px;">
                    <h1 style="color: #D4AF37; text-align: center;">💜 Nuevo Apoyo en Orion</h1>

                    <div style="background: #2a2a34; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="color: #E8B4B8; margin-top: 0;">Detalles del apoyo:</h2>
                        <p><strong style="color: #D4AF37;">Producto:</strong> ${productName}</p>
                        <p><strong style="color: #D4AF37;">Cantidad:</strong> ${amount}</p>
                        <p><strong style="color: #D4AF37;">Dispositivo:</strong> ${deviceInfo}</p>
                    </div>

                    <div style="background: #2a2a34; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="color: #E8B4B8; margin-top: 0;">Mensaje:</h2>
                        <p style="font-style: italic; color: #ccc;">"${message || 'Sin mensaje'}"</p>
                    </div>

                    ${purchaseToken ? `
                    <div style="background: #1e1e28; padding: 10px; border-radius: 8px; margin: 20px 0; font-size: 12px;">
                        <p style="color: #666;"><strong>Token:</strong> ${purchaseToken.substring(0, 50)}...</p>
                    </div>
                    ` : ''}

                    <p style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
                        Orion Feedback Server
                    </p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Email enviado correctamente');

        res.json({ success: true, message: 'Feedback recibido' });
    } catch (error) {
        console.error('❌ Error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
