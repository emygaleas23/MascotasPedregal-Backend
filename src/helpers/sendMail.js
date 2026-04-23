import sendMail from "../config/nodemailer.js";

// Email para cuando un usuario se registra, se le envía un correo de confirmación con un token para verificar su cuenta.
const sendMailToRegister = (userMail, token)=>{
    return sendMail(
        userMail,
        "¡Bienvenido a PetConnect ! 🐶🐱",
    `
            <h1>Confirma tu cuenta</h1>
            <p>Hola 👋, gracias por unirte a <strong>PetConnect </strong>.</p>
            <p>Haz clic en el siguiente enlace para confirmar tu cuenta y empezar a disfrutar de todas las funciones:</p>
            <a href="${process.env.URL_FRONTEND}/confirm-email/${token}">
                Confirmar mi cuenta
            </a>
            <hr>
            <footer>El equipo de PetConnect te da la más cordial bienvenida 💚.</footer>
        `,
    )
}

// Email para cuando un administrador registra a un usuario, se le envía un correo de confirmación con un token para verificar su cuenta y sus credenciales de acceso.
const sendMailToRegisterUser = (userMail, token)=>{
    return sendMail(
        userMail,
        "¡Bienvenido a PetConnect ! 🐶🐱",
    `
        <h1>Confirma tu cuenta</h1>
        <p>Hola 👋, has sido registrado por un administrador en <strong>PetConnect </strong>.</p>
        <p>Haz clic en el siguiente enlace para confirmar tu cuenta y empezar a disfrutar de todas las funciones:</p>
        <a href="${process.env.URL_FRONTEND}/confirm-email/${token}">
            Confirmar mi cuenta
        </a>
        <p>Estas son tus credenciales de acceso:</p>
        <ul>
            <li><strong>Email:</strong> ${userMail}</li>
            <li><strong>Contraseña:</strong> </li>
        </ul>
        <hr>
        <footer>El equipo de PetConnect te da la más cordial bienvenida 💚.</footer>
    `,
    )
}

export { sendMailToRegister, sendMailToRegisterUser }