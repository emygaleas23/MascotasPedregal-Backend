import sendMail from "../config/nodemailer.js";

// USUARIOS

// Email para cuando un usuario se registra, se le envía un correo de confirmación con un token para verificar su cuenta.
const sendMailRegistro = (userMail, token)=>{
    return sendMail(
        userMail,
        "¡Bienvenido a PetConnect ! 🐶🐱",
    `
            <h1>Confirma tu cuenta</h1>
            <p>Hola 👋, gracias por unirte a <strong>PetConnect </strong>.</p>
            <p>Haz clic en el siguiente enlace para confirmar tu cuenta y empezar a disfrutar de todas las funciones:</p>
            <a href="${process.env.URL_FRONTEND}confirm-email/${token}">
                Confirmar mi cuenta
            </a>
            <hr>
            <footer>El equipo de PetConnect te da la más cordial bienvenida 🐾</footer>
        `,
    )
}

// Email para cuando un administrador registra a un usuario, se le envía un correo de confirmación con un token para verificar su cuenta y sus credenciales de acceso.
const sendMailRegistroUsuario = (userMail, password, token)=>{
    return sendMail(
        userMail,
        "¡Bienvenido a PetConnect ! 🐶🐱",
    `
        <h1>Confirma tu cuenta</h1>
        <p>Hola 👋, has sido registrado por un administrador en <strong>PetConnect </strong>.</p>
        <p>Estas son tus credenciales de acceso:</p>
        <ul>
        <li><strong>Email:</strong> ${userMail}</li>
        <li><strong>Contraseña:</strong>${password} </li>
        </ul>
        <p>Haz clic en el siguiente enlace para confirmar tu cuenta y empezar a disfrutar de todas las funciones:</p>
        <a href="${process.env.URL_FRONTEND}confirm-email/${token}">
            Confirma mi cuenta
        </a>
        <footer>Equipo PetConnect 🐾</footer>
    `,
    )
}

// Email para reestablecer contraseña
const sendMailReestablecerPassword = (userMail,token)=>{
    return sendMail(
        userMail,
        "Reestablece tu contraseña",
        `
            <h1>PetConnect - 🐶 😺</h1>
            <p>Has solicitado restablecer tu contraseña.</p>
            <a href="${process.env.URL_FRONTEND}reset/${token}">
            Clic para restablecer tu contraseña
            </a>
            <hr>
            <footer>Equipo PetConnect 🐾</footer>
        `
    )
}

// Email para notificar que la contraseña ha cambiado
const sendMailCambioPassword = (userMail) =>{
    return sendMail(
        userMail,
        "Tu contraseña ha cambiado🐾",
        `
                <h1>PetConnect  - Tu contraseña ha cambiado</h1>
                <hr>
                <footer>Recuerda: tu seguridad es importante para nosotros 💫.</footer>
            `,
    );
}

// MASCOTAS

// Email para cuando se registra una mascota a un usuario
const sendMailRegistroMascota = (userMail, petName)=>{
    return sendMail(
        userMail,
        "Se ha registrado una mascota a tu nombre 🐾",
        `
            <h2>Nueva mascota registrada</h2>
            <p>Hola 👋</p>
            <p>Se ha registrado la mascota <strong>${petName}</strong> a tu nombre en PetConnect.</p>
            <p>Si no reconoces esta mascota, comunícate inmediatamente con el administrador.</p>
            <hr>
            <footer>Equipo PetConnect 🐾</footer>
        `,
    )
}

// Email para notificar que una mascota fue actualizada de dueño
const sendMailEliminarDuenoMascota = (userMail, petName) => {
    return sendMail(
        userMail,
        "Tu mascota ya no está registrada a tu nombre",
        `
            <h2>Actualización en el registro de mascotas</h2>
            <p>Hola</p>
            <p>La mascota <strong>${petName}</strong> ya no se encuentra registrada a tu nombre.</p>
            <p>Si crees que esto es un error, comunícate con el administrador.</p>
            <hr>
            <footer>Equipo PetConnect 🐾</footer>
        `
    );
};

// Email para notificar que un servicio fue creado
const sendMailServicioAsignado = (correoCuidador, correoDueno, mascotas, fecha_inicio, fecha_fin, horas, tarifa, total, servicios) => {
    const inicio = new Date(fecha_inicio).toLocaleString();
    const fin = new Date(fecha_fin).toLocaleString();

    const mensaje = `
    <h2>Nuevo Servicio Registrado 🐾</h2>
    <p>Mascotas: <strong>${mascotas}</strong></p>
    <p>Inicio: ${inicio}</p>
    <p>Fin: ${fin}</p>
    <p>Duración: ${horas} horas</p>
    <p>Tarifa por hora: $${tarifa}</p>
    <p>Total: $${total}</p>
    <p>Servicios: ${servicios}</p>
    <hr>
    <footer>Equipo PetConnect 🐶🐱</footer>
    `;

    // Enviar al cuidador
    sendMail(correoCuidador, "Nuevo Servicio Asignado", mensaje);

    // Enviar al dueño
    sendMail(correoDueno, "Nuevo Servicio Registrado para tu mascota", mensaje);
};

// Enviar mail cuando un servicio cambie de estado "ACTIVO", "FINALIZADO", "CANCELADO"
const sendMailEstadoServicio = (correoCuidador, correoDueno, mascotas, servicios, fecha_inicio, fecha_fin, estado) => {
    const titulo = 
        estado === "ACTIVO" ? "Servicio en curso 🐾" :
        estado === "FINALIZADO" ? "Servicio finalizado ✅" :
        "Servicio cancelado ❌";
        
    const inicio = new Date(fecha_inicio).toLocaleString();
    const fin = new Date(fecha_fin).toLocaleString();

    const mensaje = `
    <h2>Servicio ${estado} 🐾</h2>
    <p>Mascotas: <strong>${mascotas}</strong></p>
    <p>Inicio: ${inicio}</p>
    <p>Fin: ${fin}</p>
    <p>Servicios: ${servicios}</p>
    <hr>
    <footer>Equipo PetConnect 🐶🐱</footer>
    `;

    sendMail(correoCuidador, `${titulo}`, mensaje);
    sendMail(correoDueno, `${titulo}`, mensaje);
};

export{ sendMailRegistro, sendMailRegistroUsuario, sendMailReestablecerPassword, sendMailCambioPassword, sendMailRegistroMascota, sendMailEliminarDuenoMascota, sendMailServicioAsignado, sendMailEstadoServicio}