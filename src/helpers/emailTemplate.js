const emailTemplate = (title, content) => {
    return `
    <!DOCTYPE html>
    <html lang="es">

    <head>
        <meta charset="UTF-8">
        <title>${title}</title>
    </head>

    <body style="
        margin:0;
        padding:0;
        background-color:#f4f7fb;
        font-family:Arial, Helvetica, sans-serif;
    ">

        <div style="
            width:100%;
            padding:40px 0;
        ">

            <div style="
                max-width:600px;
                margin:auto;
                background:white;
                border-radius:20px;
                overflow:hidden;
                box-shadow:0 8px 25px rgba(0,0,0,0.08);
            ">

                <!-- HEADER -->
                <div style="
                    background:linear-gradient(135deg,#6366f1,#8b5cf6);
                    padding:40px;
                    text-align:center;
                    color:white;
                ">

                    <h1 style="
                        margin:0;
                        font-size:32px;
                    ">
                        🐾 PetConnect
                    </h1>

                    <p style="
                        margin-top:10px;
                        font-size:15px;
                        opacity:0.9;
                    ">
                        Conectando mascotas con amor y confianza
                    </p>

                </div>

                <!-- CONTENT -->
                <div style="
                    padding:40px 35px;
                    color:#374151;
                    line-height:1.7;
                    font-size:15px;
                ">

                    <h2 style="
                        margin-top:0;
                        color:#111827;
                        font-size:28px;
                    ">
                        ${title}
                    </h2>

                    ${content}

                </div>

                <!-- FOOTER -->
                <div style="
                    background:#f9fafb;
                    border-top:1px solid #e5e7eb;
                    padding:25px;
                    text-align:center;
                    color:#6b7280;
                    font-size:13px;
                ">

                    <p style="margin:0;">
                        © 2026 PetConnect 🐶🐱
                    </p>

                    <p style="margin-top:8px;">
                        Gracias por confiar en nosotros 💜
                    </p>

                </div>

            </div>

        </div>

    </body>
    </html>
    `;
};

export default emailTemplate;