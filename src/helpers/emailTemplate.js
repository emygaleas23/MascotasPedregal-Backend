export const emailTemplate = (title, content) => {
    return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #FDFBFA; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FDFBFA;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <table border="0" cellpadding="0" cellspacing="0" width="90%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #E9E1DA; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.03);">
                        
                        <tr>
                            <td align="center" style="background-color: #BD9F85; padding: 30px 20px;">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td align="center" style="background-color: #ffffff; border-radius: 50%; padding: 10px; width: 60px; height: 60px;">
                                            <span style="font-size: 35px;">🐾</span>
                                        </td>
                                    </tr>
                                </table>
                                <h1 style="color: #ffffff; margin: 15px 0 5px 0; font-size: 26px; letter-spacing: 1px;">PetConnect</h1>
                                <p style="color: #F3EEEA; margin: 0; font-size: 14px; font-style: italic;">Conectando dueños, cuidadores y mascotas en El Pedregal🐾</p>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #5C554E; font-size: 22px; margin-top: 0; border-bottom: 2px solid #F1E9E2; padding-bottom: 15px; display: inline-block;">
                                    ${title}
                                </h2>
                                <div style="color: #6B6259; line-height: 1.6; font-size: 16px; margin-top: 20px;">
                                    ${content}
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td align="center" style="background-color: #F8F5F2; padding: 25px; border-top: 1px solid #E9E1DA;">
                                <p style="margin: 0; color: #A0948A; font-size: 13px;">
                                    © 2026 PetConnect 🐾 - Todos los derechos reservados.
                                </p>
                                <p style="margin: 10px 0 0 0; color: #BD9F85; font-size: 14px; font-weight: bold;">
                                    Gracias por confiar en nosotros 🤎
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};

export default emailTemplate;