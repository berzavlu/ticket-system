import nodemailer from 'nodemailer';

// Configurar el transportador de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: process.env.EMAIL_SERVER_PORT === '465', // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

interface SendTicketResponseEmailParams {
  customerEmail: string;
  customerName: string;
  ticketTitle: string;
  ticketId: string;
  agentName: string;
  responseMessage: string;
}

/**
 * Envía un correo al cliente cuando recibe una respuesta a su ticket
 */
export async function sendTicketResponseEmail({
  customerEmail,
  customerName,
  ticketTitle,
  ticketId,
  agentName,
  responseMessage,
}: SendTicketResponseEmailParams): Promise<void> {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const ticketUrl = `${appUrl}/my-tickets?ticketId=${ticketId}`;

    // Limitar la longitud del mensaje de respuesta en el preview
    const previewMessage = responseMessage.length > 200 
      ? responseMessage.substring(0, 200) + '...' 
      : responseMessage;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: customerEmail,
      subject: `Nueva respuesta a tu ticket: ${ticketTitle}`,
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nueva Respuesta a tu Ticket</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  
                  <!-- Encabezado -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px;">
                      <h1 style="margin: 0; font-size: 24px; color: #1a1a1a; font-weight: 600;">
                        📩 Nueva Respuesta a tu Ticket
                      </h1>
                    </td>
                  </tr>

                  <!-- Saludo -->
                  <tr>
                    <td style="padding: 0 40px 20px 40px;">
                      <p style="margin: 0; font-size: 16px; color: #333333; line-height: 1.5;">
                        Hola <strong>${customerName}</strong>,
                      </p>
                      <p style="margin: 16px 0 0 0; font-size: 16px; color: #333333; line-height: 1.5;">
                        ${agentName} ha respondido a tu ticket <strong>"${ticketTitle}"</strong>.
                      </p>
                    </td>
                  </tr>

                  <!-- Contenido de la respuesta -->
                  <tr>
                    <td style="padding: 0 40px 30px 40px;">
                      <div style="background-color: #f8f9fa; border-left: 4px solid #3b82f6; border-radius: 4px; padding: 20px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 14px; color: #666666; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">
                          Respuesta:
                        </p>
                        <p style="margin: 12px 0 0 0; font-size: 15px; color: #1a1a1a; line-height: 1.6; white-space: pre-wrap;">
                          ${previewMessage}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Botón de acción -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px;" align="center">
                      <table role="presentation" style="border-collapse: collapse;">
                        <tr>
                          <td style="border-radius: 6px; background-color: #3b82f6;">
                            <a href="${ticketUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; color: #ffffff; text-decoration: none; font-weight: 600;">
                              Ver Ticket Completo
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin: 16px 0 0 0; font-size: 13px; color: #666666;">
                        O copia este enlace en tu navegador:<br>
                        <a href="${ticketUrl}" style="color: #3b82f6; word-break: break-all;">${ticketUrl}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #f8f9fa; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                      <p style="margin: 0; font-size: 13px; color: #666666; line-height: 1.5;">
                        Este correo fue enviado automáticamente desde nuestro sistema de tickets.
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 13px; color: #666666; line-height: 1.5;">
                        Si tienes alguna pregunta, puedes responder directamente al ticket en nuestra plataforma.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
Hola ${customerName},

${agentName} ha respondido a tu ticket "${ticketTitle}".

Respuesta:
${previewMessage}

Para ver el ticket completo y responder, visita:
${ticketUrl}

---
Este correo fue enviado automáticamente desde nuestro sistema de tickets.
      `.trim(),
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email de notificación enviado a ${customerEmail}`);
  } catch (error) {
    console.error('❌ Error al enviar email de notificación:', error);
    // No lanzamos el error para que no falle la creación de la respuesta
    // Solo registramos el error
  }
}

/**
 * Verifica que el servicio de email esté configurado correctamente
 */
export async function verifyEmailConfiguration(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('✅ Servidor de correo configurado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error en la configuración del servidor de correo:', error);
    return false;
  }
}

