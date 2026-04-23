import Usuario from "../../models/usuarios/Usuario";
import { createToken } from "../../middlewares/JWT";
import { sendMailToRegister } from "../../helpers/sendMail";

// REGISTRO DE USUARIO: 

const registrarUsuario = async (req, res) => {
    try {
        const { email, password, rol, nombre, apellido, telefono } = req.body;

        if (!email || !password || !rol || !nombre || !apellido || !telefono) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        // Bloquear ADMINISTRADOR en el registro
        if (rol === "ADMINISTRADOR") {
            return res.status(403).json({ msg: "No permitido registrarse como administrador" });
        }

        // Solo permitir roles válidos
        if (!["DUEÑO", "CUIDADOR"].includes(rol)) {
            return res.status(400).json({ msg: "Rol inválido" });
        }

        const emailLower = email.toLowerCase().trim();
        const emailRegex = /\S+@\S+\.\S+/;
        
        // Validación email: formato correcto, debe ser único
        if (!emailRegex.test(emailLower)) {
            return res.status(400).json({ msg: "El email no es válido" });
        }

        const existe = await Usuario.findOne({ email: emailLower });
        if (existe) {
            return res.status(400).json({ msg: "Lo sentimos, el email ya está registrado" });
        }
        
        // Validación contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{16,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ msg: "La contraseña debe tener al menos 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales" });
        }

        // Validación telefono: solo números, 10 dígitos, debe ser único
        const telefonoRegex = /^\d{10}$/;
        if (!telefonoRegex.test(telefono.trim())) {
            return res.status(400).json({ msg: "El teléfono no es válido, debe contener solo números y tener 10 dígitos" });
        }

        const telefonoExiste = await Usuario.findOne({ telefono: telefono.trim() });
        if (telefonoExiste) {
            return res.status(400).json({ msg: "Lo sentimos, el teléfono ya está registrado" });
        }

        const nuevoUsuario = new Usuario(emailLower, password, rol, nombre, apellido, telefono.trim());

        const token = nuevoUsuario.createToken();

        nuevoUsuario.verificado = false; // El usuario no está verificado hasta que confirme su email

        await nuevoUsuario.save(); 
        await sendMailToRegister(email, token); // Enviar email de confirmación

        res.status(201).json({
            msg: "Usuario registrado correctamente. Revisa tu correo para confirmar la cuenta.",
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const confirmarEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const usuario = await Usuario.findOne({ token });

        if (!usuario) {
            return res.status(400).json({ msg: "Token inválido o cuenta ya confirmada" });
        }

        usuario.verificado = true; // Marcar el usuario como verificado
        usuario.token = null; // Limpiar el token para evitar reutilización
        await usuario.save();

        res.status(200).json({ msg: "Cuenta verificada correctamente. Ya puedes iniciar sesión." });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export { registrarUsuario, confirmarEmail };