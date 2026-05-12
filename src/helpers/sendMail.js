import sendMail from "../config/nodemailer.js";
import emailTemplate from "./emailTemplate.js";

// --- USUARIOS ---

const sendMailRegistro = (userMail, rol, token) => {
    const confirmationUrl = `${process.env.URL_FRONTEND}confirm-email/${token}`;
    return sendMail(
        userMail,
        "Confirma tu cuenta - PetConnect",
        emailTemplate(
            "¡Bienvenido a la comunidad!",
            `
            <p style="margin-top: 0;">Hola,</p>
            <p>Gracias por registrarte en <strong>PetConnect</strong>. Tu cuenta ha sido creada exitosamente con el perfil de: <strong>${rol}</strong>.</p>
            <p>Para activar tu cuenta, por favor haz clic en el siguiente botón:</p>
            <div style="text-align: center; margin: 35px 0;">
                <a href="${confirmationUrl}" style="background-color: #A88F77; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Confirmar mi cuenta
                </a>
            </div>
            <p style="font-size: 13px; color: #B2A69A; border-top: 1px solid #EAE1D9; padding-top: 20px;">
                Si tienes problemas con el botón, copia este enlace: <br>
                <span style="color: #A88F77;">${confirmationUrl}</span>
            </p>
            <div style="font-size: 13px; color: #B2A69A; border-top: 1px solid #EAE1D9; padding-top: 25px; margin-top: 35px;">
                <p style="margin-bottom: 10px;">
                    <strong>¿No esperabas este correo?</strong> Si no has solicitado el registro en nuestra plataforma o crees que se trata de un error, por favor ignora este mensaje con total seguridad; la cuenta no se activará si no haces clic en el botón.
                </p>
            </div>
            `
        )
    );
};

const sendMailRegistroUsuario = (userMail, rol, password, token) => {
    const confirmationUrl = `${process.env.URL_FRONTEND}confirm-email/${token}`;
    return sendMail(
        userMail,
        "Confirma tu cuenta - PetConnect",
        emailTemplate(
            "¡Bienvenido a la comunidad!",
            `
            <p style="margin-top: 0;">Hola,</p>
            <p>Un administrador te ha registrado con el perfil de: <strong>${rol}</strong>.</p>
            <div style="background-color: #FBF9F6; border: 1px solid #E9E1DA; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Email:</strong> ${userMail}</p>
                <p style="margin: 0; font-size: 14px;"><strong>Contraseña temporal:</strong> ${password}</p>
            </div>
            <p>Haz clic abajo para confirmar tu cuenta e iniciar sesión:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="background-color: #A88F77; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Confirmar y Activar
                </a>
            </div>
            <div style="font-size: 13px; color: #B2A69A; border-top: 1px solid #EAE1D9; padding-top: 25px; margin-top: 35px;">
                <p style="margin-bottom: 10px;">
                    <strong>¿No esperabas este correo?</strong> Si no has solicitado el registro en nuestra plataforma o crees que se trata de un error, por favor ignora este mensaje con total seguridad; la cuenta no se activará si no haces clic en el botón.
                </p>
                <p style="margin: 0;">
                    <strong>Nota:</strong> Te recomendamos cambiar tu contraseña temporal una vez que hayas ingresado a tu panel.
                </p>
            </div>
            `
        )
    );
};

const sendMailUsuarioDesactivado = (userMail) => {
    return sendMail(
        userMail,
        "Cuenta desactivada - PetConnect",
        emailTemplate(
            "Estado de cuenta",
            `
            <p style="margin-top: 0;">Tu cuenta en <strong>PetConnect</strong> ha sido desactivada.</p>
            <p>Si consideras que esto es un error o deseas conocer los motivos, por favor comunícate con un administrador del sistema.</p>
            `
        )
    );
};

const sendMailUsuarioActivado = (userMail) => {
    return sendMail(
        userMail,
        "Cuenta activada - PetConnect",
        emailTemplate(
            "¡Cuenta lista!",
            `
            <p style="margin-top: 0;">Tu cuenta ha sido <strong>activada correctamente</strong>.</p>
            <p>Ya puedes iniciar sesión nuevamente y disfrutar de todas las funcionalidades de nuestra plataforma.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.URL_FRONTEND}" style="background-color: #A88F77; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Ir al Panel
                </a>
            </div>
            `
        )
    );
};

const sendMailReestablecerPassword = (userMail, token) => {
    const resetUrl = `${process.env.URL_FRONTEND}reset/${token}`;
    return sendMail(
        userMail,
        "Restablece tu contraseña - PetConnect",
        emailTemplate(
            "Recuperar acceso",
            `
            <p style="margin-top: 0;">Has solicitado restablecer tu contraseña en PetConnect.</p>
            <p>Haz clic en el botón para generar una nueva:</p>
            <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" style="background-color: #A88F77; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Restablecer contraseña
                </a>
            </div>
            <p style="font-size: 13px; color: #B2A69A;">Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            `
        )
    );
};

const sendMailCambioPassword = (userMail) => {
    return sendMail(
        userMail,
        "Seguridad: Cambio de contraseña - PetConnect",
        emailTemplate(
            "Contraseña actualizada",
            `
            <p style="margin-top: 0;">Te informamos que la contraseña de tu cuenta ha sido <strong>cambiada exitosamente</strong>.</p>
            <p>Si no realizaste esta acción, por favor contáctate de inmediato con el administrador.</p>
            <p style="color: #A88F77; font-weight: bold;">Tu seguridad es nuestra prioridad. 💫</p>
            `
        )
    );
};

// --- MASCOTAS ---

const sendMailRegistroMascota = (userMail, petName) => {
    return sendMail(
        userMail,
        "Nueva mascota registrada 🐾",
        emailTemplate(
            "¡Nueva mascota!",
            `
            <p style="margin-top: 0;">Hola,</p>
            <p>Se ha registrado a <strong>${petName}</strong> bajo tu nombre en PetConnect.</p>
            <p>Ahora puedes gestionar sus servicios y cuidados desde tu panel personal.</p>
            <p style="font-size: 13px; color: #B2A69A; margin-top: 20px;">Si no reconoces este registro, contacta con la administración.</p>
            `
        )
    );
};

const sendMailEliminarDuenoMascota = (userMail, petName) => {
    return sendMail(
        userMail,
        "Actualización de registro de mascota",
        emailTemplate(
            "Aviso de actualización",
            `
            <p style="margin-top: 0;">Te informamos que la mascota <strong>${petName}</strong> ya no se encuentra vinculada a tu nombre en nuestra plataforma.</p>
            <p>Si consideras que esto es un error, por favor comunícate con un administrador.</p>
            `
        )
    );
};

// --- SERVICIOS ---

const sendMailServicioAsignado = (correoCuidador, correoDueno, mascotas, fecha_inicio, fecha_fin, horas, tarifa, total, servicios) => {
    const inicio = new Date(fecha_inicio).toLocaleString();
    const fin = new Date(fecha_fin).toLocaleString();

    const content = `
    <h3 style="color: #A88F77; margin-top: 0;">Detalles del Servicio 🐾</h3>
    <div style="background-color: #FBF9F6; border: 1px solid #E9E1DA; border-radius: 8px; padding: 20px;">
        <p style="margin: 5px 0;"><strong>Mascotas:</strong> ${mascotas}</p>
        <p style="margin: 5px 0;"><strong>Servicios:</strong> ${servicios}</p>
        <p style="margin: 5px 0;"><strong>Inicio:</strong> ${inicio}</p>
        <p style="margin: 5px 0;"><strong>Fin:</strong> ${fin}</p>
        <p style="margin: 5px 0;"><strong>Tarifa por hora:</strong> ${tarifa}</p>
        <p style="margin: 15px 0 5px 0; font-size: 18px; color: #5C554E;"><strong>Total: $${total}</strong></p>
    </div>
    `;

    sendMail(correoCuidador, "Nuevo Servicio Asignado", emailTemplate("Tienes un nuevo servicio asignado", content));
    sendMail(correoDueno, "Nuevo Servicio Registrado", emailTemplate("Nuevo servicio para tu mascota", content));
};

const sendMailEstadoServicio = (correoCuidador, correoDueno, mascotas, servicios, fecha_inicio, fecha_fin, estado) => {
    const titulos = {
        "ACTIVO": "Servicio en curso 🐾",
        "FINALIZADO": "Servicio finalizado ✅",
        "CANCELADO": "Servicio cancelado ❌"
    };

    const inicio = new Date(fecha_inicio).toLocaleString();
    const fin = new Date(fecha_fin).toLocaleString();

    const content = `
    <h3 style="color: #A88F77; margin-top: 0;">Estado: ${estado}</h3>
    <div style="background-color: #FBF9F6; border: 1px solid #E9E1DA; border-radius: 8px; padding: 20px;">
        <p><strong>Mascotas:</strong> ${mascotas}</p>
        <p><strong>Servicios:</strong> ${servicios}</p>
        <p><strong>Inicio:</strong> ${inicio}</p>
        <p><strong>Fin:</strong> ${fin}</p>
    </div>
    `;

    sendMail(correoCuidador, titulos[estado] || "Actualización de Servicio", emailTemplate("Actualización de estado", content));
    sendMail(correoDueno, titulos[estado] || "Actualización de Servicio", emailTemplate("Actualización de estado", content));
};

export { 
    sendMailRegistro, 
    sendMailRegistroUsuario, 
    sendMailUsuarioDesactivado, 
    sendMailUsuarioActivado, 
    sendMailReestablecerPassword, 
    sendMailCambioPassword, 
    sendMailRegistroMascota, 
    sendMailEliminarDuenoMascota, 
    sendMailServicioAsignado, 
    sendMailEstadoServicio 
};