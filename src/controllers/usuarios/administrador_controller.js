import { sendMailRegistroUsuario } from "../../helpers/sendMail.js";
import Usuario from "../../models/usuarios/Usuario.js";
import Cuidador from "../../models/usuarios/Cuidador.js";
import mongoose from "mongoose";

// REGISTRO DE USUARIO: 
const registrarUsuario = async (req, res) => {
    try {
        const { email, password, rol, nombre, apellido, telefono } = req.body;

        if (!email || !password || !rol || !nombre || !apellido || !telefono) {
            return res.status(400).json({ msg: "Todos los campos son obligatorios" });
        }

        const rolUpper = rol.toUpperCase().trim()

        // Solo permitir roles válidos
        if (!["ADMINISTRADOR","DUEÑO", "CUIDADOR"].includes(rolUpper)) {
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

        // Validación telefono: solo números, 10 dígitos, debe ser único
        const telefonoRegex = /^\d{10}$/;
        if (!telefonoRegex.test(telefono.trim())) {
            return res.status(400).json({ msg: "El teléfono no es válido, debe contener solo números y tener 10 dígitos" });
        }

        const telefonoExiste = await Usuario.findOne({ telefono: telefono.trim() });
        if (telefonoExiste) {
            return res.status(400).json({ msg: "Lo sentimos, el teléfono ya está registrado" });
        }

        // Generar contraseña
        const numsaleatorios = Math.random().toString(36).toUpperCase().slice(2,10)
        const passwordGenerado = `@Usuario${numsaleatorios}26`

        const nuevoUsuario = new Usuario({email:emailLower, password: passwordGenerado, rol:rolUpper, nombre, apellido, telefono:telefono.trim()});

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
        // await sendMailRegistroUsuario(email, passwordGenerado, token); // Enviar email de confirmación

        res.status(201).json({
            msg: "Usuario registrado correctamente. Revisa tu correo para confirmar la cuenta.",
        });

    } catch (error) {
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

// LISTAR USUARIOS
const listarUsuarios = async (req, res) => {
    try{
        const usuarios = await Usuario.find().select("-password");
        res.status(200).json(usuarios)
    }catch(error){
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}

// MOSTRAR UN USUARIO EN ESPECIFICO
const detalleUsuario = async(req, res) => {
    try{
        const {id} = req.params
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:"ID inválido"})
        const usuario = await Usuario.findById(id).select("-createdAt -updatedAt -__v -password -token")
        if (!usuario) return res.status(400).json({msg:`Usuario con id ${id} no encontrado`})
        res.status(200).json(usuario)
    }catch(error){
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}

// ACTUALIZAR UN USUARIO
const actualizarUsuario = async (req, res) =>{
    try{
        const {id} = req.params
        const {nombre, apellido, telefono, estado, verificado } = req.body

        const usuario = await Usuario.findById(id);

        if (!usuario) return res.status(400).json({msg:`Usuario con id ${id} no encontrado`})

        if(estado !== undefined) usuario.estado = estado;
        if(verificado !== undefined) usuario.verificado = verificado;
        
        if(nombre){
            const nombreTrim = nombre.trim()
            if (!nombreTrim) return res.status(400).json({msg:"El nombre no puede estar vacío."})
            usuario.nombre = nombreTrim;
        }

        if(apellido){
            const apellidoTrim = apellido.trim()
            if (!apellidoTrim) return res.status(400).json({msg:"El apellido no puede estar vacío."})
            usuario.apellido = apellidoTrim;
        }

        if(telefono && telefono != usuario.telefono){
            const telefonoRegex = /^\d{10}$/;
            const telefonoTrim = telefono.trim();
            
            if (!telefonoRegex.test(telefonoTrim)) {
                return res.status(400).json({ msg: "El teléfono no es válido, debe contener solo números y tener 10 dígitos" });
            }

            const telefonoExiste = await Usuario.findOne({telefono: telefonoTrim, _id: {$ne: id}})
            if(telefonoExiste) return res.status(400).json({msg:`El teléfono ya se encuentra registrado`})
            
            usuario.telefono = telefonoTrim
        }

        await usuario.save()
        res.status(200).json({msg: "Usuario actualizado por un administrador", usuario})
    }catch(error){
        res.status(500).json({msg: `Error en el servidor - ${error}`})
    }
}

// ELIMINAR USUARIO
const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findById(id);
        if (!usuario) return res.status(404).json({ msg: "Usuario no encontrado" });

        if (!usuario.estado) {
            return res.status(400).json({ msg: "Este usuario ya se encuentra desactivado" });
        }

        if(!usuario.verificado){ // Si el usuario no ha sido verificado, se elimina de la bdd
            await Usuario.findByIdAndDelete(id)
            if (usuario.rol === "CUIDADOR"){
                await Cuidador.findOneAndDelete({usuario:id});
            }
            return res.status(200).json({msg:"Usuario no verificado eliminado permanentemente"})
        }

        // Si el usuario está verificado, borrado lógico
        if (!usuario.estado){
            return res.status(400).json({ msg: "Este usuario ya se encuentra desactivado" });
        }

        usuario.estado = false;
        await usuario.save();

        res.status(200).json({ msg: "Usuario desactivado correctamente por el administrador" });
    } catch (error) {
        res.status(500).json({ msg: `Error en el servidor - ${error.message}` });
    }
};

export {registrarUsuario, listarUsuarios, detalleUsuario, actualizarUsuario, eliminarUsuario}