import cron from "node-cron";
import compromisoSanitario from "../models/compromisos_sanitarios/compromisoSanitario.js";
import sendMail from "../config/nodemailer.js";

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
                <h2>Recordatorio Sanitario 🐾</h2>
                <p>${mensajeExtra}</p>
                <p>Hola ${dueno.nombre},</p>
                <p>Tu mascota <strong>${mascota.nombre}</strong> tiene un compromiso pendiente:</p>
                <p><strong>Tipo:</strong> ${c.tipo}</p>
                <p><strong>Fecha:</strong> ${c.proxima_fecha.toLocaleDateString()}</p>
                <hr>
                <footer>PetConnect 🐶🐱</footer>
            `;

            await sendMail(dueno.email, "Recordatorio de compromiso sanitario", mensaje);

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