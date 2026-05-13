import cron from "node-cron";
import compromisoSanitario from "../models/compromisos_sanitarios/compromisoSanitario.js";
import sendMail from "../config/nodemailer.js";
import emailTemplate from "../helpers/emailTemplate.js";

cron.schedule("0 9 * * *", async () => { // Se repite todos los días a las 9 am
    console.log("Verificando compromisos sanitarios...");

    const hoy = new Date();
    hoy.setHours(0,0,0,0);

    const limite = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Traer compromisos relevantes
    const compromisos = await compromisoSanitario.find({
        estado: "PENDIENTE",
        proxima_fecha: {
            $gte: hoy,
            $lte: limite
        }
    }).populate({
        path: "mascota_id",
        populate: {
            path: "owner_id",
            select: "email nombre"
        }
    });

    for (const c of compromisos) {
        try {
            // Validar populate
            if (!c.mascota_id || !c.mascota_id.owner_id) continue;

            const mascota = c.mascota_id;
            const dueno = mascota.owner_id;

            const fechaCompromiso = new Date(c.proxima_fecha);
            fechaCompromiso.setHours(0,0,0,0);

            const diasRestantes = Math.floor(
                (fechaCompromiso - hoy) / (1000 * 60 * 60 * 24)
            );

            const diasObjetivo = [7, 3, 0];

            if (!diasObjetivo.includes(diasRestantes)) continue;

            if (c.recordatorios_enviados.includes(diasRestantes)) continue;

            let mensajeExtra = diasRestantes === 0
                ? "⚠️ ¡Es HOY!"
                : `Faltan ${diasRestantes} días`;

            const mensaje = `
                <p style="margin-top: 0;">
                    Hola <strong>${dueno.nombre}</strong>, 
                </p>
                <p>
                Queremos recordarte que tu mascota
                <strong>${mascota.nombre}</strong>
                tiene un compromiso sanitario pendiente.
                </p> 
                <div style=" background-color: #FBF9F6; border: 1px solid #E9E1DA; border-radius: 10px; padding: 22px; margin: 30px 0; ">
                    <p style=" margin-top: 0; color: #A88F77; font-weight: bold; font-size: 16px; "> 
                    ${mensajeExtra}
                    </p> 
                    <p style="margin: 10px 0;">
                        <strong>Mascota:</strong> ${mascota.nombre}
                    </p>
                    <p style="margin: 10px 0;">
                        <strong>Compromiso:</strong> ${c.tipo}
                    </p>
                    <p style="margin: 10px 0;">
                        <strong>Fecha programada:</strong> ${c.proxima_fecha.toLocaleDateString()} 
                    </p>
                </div> 
                <p style=" font-size: 14px; color: #8B7D70; "> 
                    Mantener al día los compromisos sanitarios ayuda a garantizar el bienestar y cuidado adecuado de tu mascota 🐾 
                </p>                
            `;

            await sendMail(dueno.email, "Recordatorio de compromiso sanitario", emailTemplate("Compromiso sanitario pendiente",mensaje));

            c.recordatorios_enviados.push(diasRestantes);
            await c.save();

            console.log(`Notificación enviada a ${dueno.email}`);

        } catch (error) {
            console.error("Error procesando compromiso:", error);
        }
    }

}, {
    timezone: "America/Guayaquil"
});