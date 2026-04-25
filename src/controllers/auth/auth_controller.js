import Usuario from "../../models/usuarios/Usuario.js";
import { createToken } from "../../middlewares/JWT.js";
import { sendMailRegistro, sendMailReestablecerPassword, sendMailCambioPassword } from "../../helpers/sendMail.js";
import Cuidador from "../../models/usuarios/Cuidador.js";
import mongoose from "mongoose";

import { subirBase64Cloudinary, subirImagenCloudinary } from "../../helpers/uploadCloudinary.js";

// REGISTRO DE USUARIO: 
const registrarUsuario = async (req, res) => {
    try {
        const { email, password, rol, nombre, apellido, telefono } = req.body;

        if (!email || !password || !rol || !nombre || !apellido || !telefono) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        const rolUpper = rol.toUpperCase().trim()

        // Bloquear ADMINISTRADOR en el registro
        if (rolUpper.includes("ADMINISTRADOR")) {
            return res.status(403).json({ msg: "No permitido registrarse como administrador" });
        }

        // Solo permitir roles válidos
        if (!["DUEÑO", "CUIDADOR"].includes(rolUpper)) {
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

        const nuevoUsuario = new Usuario({email:emailLower, password, rol:rolUpper, nombre, apellido, telefono:telefono.trim()});

        const token = nuevoUsuario.createToken();

        nuevoUsuario.verificado = false; // El usuario no está verificado hasta que confirme su email

        const usuarioGuardado = await nuevoUsuario.save();
        if(usuarioGuardado.rol === "CUIDADOR"){
            const perfilCuidador = new Cuidador({
                usuario: usuarioGuardado._id,
                tarifa_hora:0,
                servicios_ofrecidos: [],
                biografia: "",
            })
            await perfilCuidador.save()
        }
        await sendMailRegistro(email, token); // Enviar email de confirmación

        res.status(201).json({
            msg: "Usuario registrado correctamente. Revisa tu correo para confirmar la cuenta.",
        });

    } catch (error) {
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

// CONFIRMAR EMAIL
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

// LOGIN
const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ msg: "Email y contraseña son obligatorios" });
        }

        const emailLower = email.toLowerCase().trim();
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(emailLower)) {
            return res.status(400).json({ msg: "El email no es válido" });
        }

        const usuario = await Usuario.findOne({ email: emailLower });
        if (!usuario) {
            return res.status(400).json({ msg: "Usuario no encontrado" });
        }

        if (!usuario.verificado) {
            return res.status(403).json({ msg: "Cuenta no verificada. Revisa tu correo para confirmar tu cuenta." });
        }

        if(!usuario.estado){
            return res.status(403).json({msg:"Tu cuenta ha sido desactivada. Contacta al administrador."})
        }

        const verificarPassword = await usuario.matchPassword(password);
        if (!verificarPassword) {
            return res.status(400).json({ msg: "Contraseña incorrecta." });
        }

        const {nombre, apellido, rol, telefono, _id} = usuario;

        const token = createToken(
            usuario._id.toString()
        )

        res.status(200).json({
            msg: "Inicio de sesión exitoso",
            token,
            rol,
            nombre,
            apellido,
            telefono,
            _id,
            email: usuario.email
        });
    } catch (error) {
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

// REESTABLECER CONTRASEÑA
const reestablecerPassword = async (req, res) => {
    try{
        const {email} = req.body;

        if (!email){
            return res.status(400).json({msg: "Debes ingresar un correo electrónico"})
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email.toLowerCase().trim())){
            return res.status(400).json({msg: "El correo electrónico no es válido"})
        }

        const usuario = await Usuario.findOne({email:email.toLowerCase()})

        if (!usuario) return res.status(400).json({ msg: "El usuario no se encuentra registrado"});
        if(!usuario.verificado) return res.status(400).json({ msg: "Primero debes validar tu cuenta"});

        const token = usuario.createToken();
        usuario.token = token;

        await sendMailReestablecerPassword(email,token)
        await usuario.save();

        res.status(200).json({msg:"Revisa tu correo para reestablecer tu contraseña."})
    } catch(error){
        console.error(error)
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}

// COMPROBAR EL TOKEN PARA REESTABLECER CONTRASEÑA
const comprobarTokenPassword = async (req, res) => {
    try {
        const { token } = req.params;

        const usuario = await Usuario.findOne({ token });
        if (usuario?.token !== token)
        return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });

        res.status(200).json({ msg: "Cuenta confirmada, ya puedes crear tu nueva contraseña" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: ` Error en el servidor ${error}` });
    }
};

// CREAR NUEVA CONTRASEÑA
const crearNuevoPassword = async (req, res) => {
    try {
        const { password, confirmpassword } = req.body;
        const { token } = req.params;

        if (!password || !confirmpassword){
            return res.status(400).json({msg:"Todos los campos son obligatorios"})
        }

        if (password !== confirmpassword)
            return res.status(404).json({ msg: "Las contraseñas no coinciden" });

        // Validación contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{16,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ msg: "La contraseña debe tener al menos 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales" });
        }
        
        const usuario = await Usuario.findOne({ token });
        if (!usuario) return res.status(404).json({ msg: "No se puede validar la cuenta" });

        usuario.token = null;
        usuario.password = password;
        await usuario.save();
        await sendMailCambioPassword(usuario.email)

        res.status(200).json({msg: "Ya puedes iniciar sesión en tu cuenta."});
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

// DETALLES PERFIL USUARIO
const detallesPerfil = async (req, res) => {
    try{
        res.status(200).json(req.usuario)
    }catch(error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

// ACTUALIZAR PERFIL INFORMACIÓN PERSONAL
const actualizarPerfil = async (req, res) =>{
    try{
        const id =req.usuario._id;
        
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({msg: "ID de usuario no válido"})
        }
        
        const usuario = await Usuario.findById(id);
        if(!usuario){
            return res.status(404).json({msg: "Usuario no encontrado"})
        }

        if(!req.body || Object.keys(req.body).length === 0) return res.status(400).json({msg: "No se han enviado datos para actualizar."})

        const {nombre, apellido, email, telefono, fechaNacimiento} = req.body;

        if (nombre) usuario.nombre = nombre.trim();
        if (apellido) usuario.apellido = apellido.trim();

        if (email && usuario.email !== email.toLowerCase().trim()) {
            const emailRegex= /\S+@\S+\.\S+/;
            const emailLower = email.toLowerCase().trim();
            if (!emailRegex.test(emailLower)){
                return res.status(400).json({msg: "El email no es válido"})
            }
            const emailExistente = await Usuario.findOne({ email: emailLower });
            if (emailExistente) {
                return res.status(400).json({ msg: `El email ya se encuentra registrado` });
            }
            usuario.email = emailLower;
        }

        if (telefono && telefono !== usuario.telefono){
            const telefonoRegex = /^\d{10}$/;
            const telefonoTrim = telefono.trim();
            if (!telefonoRegex.test(telefonoTrim)) {
                return res.status(400).json({ msg: "El teléfono no es válido, debe contener solo números y tener 10 dígitos" });
            }

            const existeTelefono = await Usuario.findOne({telefono: telefonoTrim});
            if (existeTelefono){
                return res.status(400).json({ msg: "Este número de teléfono ya está en uso por otro usuario." });
            }
            usuario.telefono = telefonoTrim;
        }
        if (fechaNacimiento){
            const fecha = new Date(fechaNacimiento);
            const hoy = new Date();
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(fechaNacimiento)){
                return res.status(400).json({msg: "El formato de fecha no es válido, debe ser YYYY-MM-DD"})
            }
            if(fecha>hoy){
                return res.status(400).json({msg: "La fecha de nacimiento no puede ser en el futuro."})
            }
            usuario.fechaNacimiento = fechaNacimiento;
        }

        // GUARDAR CAMBIOS
        await usuario.save();

        res.status(200).json({
            msg: "Perfil actualizado correctamente",
            usuario: {
                nombre: usuario.nombre,
                apellido: usuario.apellido,
                email: usuario.email,
                telefono: usuario.telefono,
                fechaNacimiento: usuario.fechaNacimiento,
                rol: usuario.rol,
            }
        });

    }catch(error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

// AGREGAR O ACTUALIZAR FOTO DE PERFIL
const actualizarFotoPerfil = async (req, res) => {
    try {
        const id =req.usuario._id;
        // Validar ID
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`ID inválido ${id}`})

        // IMAGEN
        const imagenFile = req.files?.imagen;
        const imagenBase64 = req.body?.imagen

        // Validara que venga algo
        if (!imagenFile && !imagenBase64) {
            return res.status(400).json({ msg: "No se ha proporcionado ninguna imagen" });
        }

        // Validar que el usuario exista
        const usuario = await Usuario.findById(id);
        if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

        // Lógica para subir el archivo
        let secure_url;
        if (imagenFile) {
            const resp = await subirImagenCloudinary(imagenFile.tempFilePath, "Avatares-Usuarios");
            secure_url = resp.secure_url;
        } // Caso base64
        else if (imagenBase64?.startsWith("data:image")) {
            secure_url = await subirBase64Cloudinary(imagenBase64, "Avatares-Usuarios");
        } else {
            return res.status(400).json({ msg: "Formato de imagen no válido" });
        }

        usuario.avatar_url = secure_url;

        await usuario.save();

        res.status(200).json({ msg:"Foto de perfil actualizada correctamente", avatar_url: usuario.avatar_url});

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Error al subir la imagen" });
    }
};

// ACTUALIZAR CONTRASEÑA
const actualizarPassword = async (req, res) => {
    try {
        const { passwordactual, passwordnuevo } = req.body;
        const {id} = req.usuario;

        const usuario = await Usuario.findById(id)

        if(!usuario){
            return res.status(404).json({msg:`Lo sentimos, no existe el usuario ${id}`})
        }

        if(!passwordactual || !passwordnuevo){
            return res.status(400).json({msg:`Debes ingresar todos los campos`})
        }

        const verificarPassword = await usuario.matchPassword(passwordactual)

        if (!verificarPassword) return res.status(404).json({msg: `Lo sentimos, la contraseña actual no es correcta`})

        // Validación contraseña
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{16,}$/;
        if (!passwordRegex.test(passwordnuevo)) {
            return res.status(400).json({ msg: "La contraseña debe tener al menos 16 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales" });
        }

        usuario.password = passwordnuevo;

        await usuario.save()
        await sendMailCambioPassword(usuario.email)
        
        res.status(200).json({msg: "Se ha actualizado la contraseña correctamente."});
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

export { registrarUsuario, confirmarEmail, loginUsuario, reestablecerPassword, comprobarTokenPassword, crearNuevoPassword, detallesPerfil, actualizarPerfil, actualizarFotoPerfil, actualizarPassword};