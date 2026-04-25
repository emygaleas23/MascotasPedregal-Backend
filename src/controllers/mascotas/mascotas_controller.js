import Mascota from "../../models/mascotas/Mascota.js";
import Usuario from "../../models/usuarios/Usuario.js";
import mongoose from "mongoose";

import { subirBase64Cloudinary, subirImagenCloudinary } from "../../helpers/uploadCloudinary.js";
import {v2 as cloudinary} from "cloudinary"
import fs from "fs-extra"

import { sendMailRegistroMascota, sendMailEliminarDuenoMascota } from "../../helpers/sendMail.js";

const registroMascota = async(req, res) =>{
    try{
        const {owner_id, nombre, tipo, raza, genero, tamano, color, fecha_nacimiento, descripcion, foto_principal} = req.body;
        const usuarioLogueado = req.usuario
        // 1. Lógica de asignación de dueño
        let duenoID;
        if (usuarioLogueado.rol === "ADMINISTRADOR") {
            if(!owner_id){
                return res.status(400).json({msg: "Como administrador, debes proporcionar el ID de un dueño registrado para la mascota."})
            }
            duenoID = owner_id;
        } else if(usuarioLogueado.rol === "DUEÑO"){
            // El Dueño solo puede registrar mascotas para sí mismo
            if(owner_id !== usuarioLogueado._id){
                return res.status(400).json({msg:"No puedes asignar una mascota a otro usuario"})
            }
            duenoID = usuarioLogueado._id;
        } else {
            return res.status(400).json({msg: "No tienes permisos para registrar mascotas."})
        }

        // 2. Validaciones básicas
        if (!mongoose.Types.ObjectId.isValid(duenoID)) {
            return res.status(400).json({ msg: "ID de dueño no válido" });
        }
        
        const dueno = await Usuario.findById(duenoID);
        if (!dueno) {
            return res.status(404).json({ msg: "El dueño especificado no existe" });
        }

        if (!nombre?.trim() || !tipo?.trim() || !raza?.trim() || !genero?.trim() || !tamano?.trim() || !color?.trim() || !fecha_nacimiento.trim()) {
            return res.status(400).json({ msg: "La información básica de la mascota es obligatoria." });
        }
        const tipoMayus = tipo.toUpperCase().trim()
        if (!["PERRO", "GATO", "OTRO"].includes(tipoMayus)){
            return res.status(400).json({msg:"Debes ingresar un tipo válido"})
        }
        const generoMayus = genero.toUpperCase().trim()
        if (!["H", "M"].includes(generoMayus)){
            return res.status(400).json({msg:"Debes ingresar un género válido 'M' (MACHO) o 'H'(HEMBRA)"})
        }
        const tamanoMayus = tamano.toUpperCase().trim()
        if(!["PEQUEÑO","MEDIANO","GRANDE"].includes(tamanoMayus)){
            return res.status(400).json({msg:"Debes ingresar un tamaño válido 'PEQUEÑO', 'MEDIANO' o 'GRANDE'"})
        }

        if(fecha_nacimiento){
            const fecha = new Date(fecha_nacimiento);
            const hoy = new Date();
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(fecha_nacimiento.trim())){
                return res.status(400).json({msg: "El formato de fecha no es válido, debe ser YYYY-MM-DD"})
            }
            if(fecha>hoy){
                return res.status(400).json({msg: "La fecha de nacimiento no puede ser en el futuro."})
            }
        }

        const nombreTrim = nombre.trim()
        // 3. Crear mascota
        const nuevaMascota = new Mascota({
            owner_id: duenoID,
            nombre: nombreTrim,
            tipo: tipoMayus,
            raza,
            genero:generoMayus,
            tamano:tamanoMayus,
            color,
            foto_principal,
            fecha_nacimiento:fecha_nacimiento.trim(),
            descripcion
        });

        // 4. Manejo de imagen (si el admin o dueño sube una foto)
        if (req.files?.foto_principal) {
            // Caso 1: archivo (multipart/form-data)
            const {secure_url} = await subirImagenCloudinary(req.files.foto_principal.tempFilePath, { folder: "Avatares-Mascotas"});
            nuevaMascota.foto_principal = secure_url;
        } else if (req.body?.foto_principal && req.body.foto_principal.startsWith("data:image")) {
            // Caso 2: base64
            const secure_url = await subirBase64Cloudinary(
                req.body.foto_principal,
                "Avatares-Mascotas"
            );
            nuevaMascota.foto_principal = secure_url;
        }

        const mascotaGuardada = await nuevaMascota.save();

        // await sendMailRegistroMascota(dueno.email, mascotaGuardada.nombre);

        res.status(201).json({msg: "Mascota registrada con éxito", mascota: mascotaGuardada});
    } catch (error){
        res.status(500).json({ msg: `Error en el servidor - ${error.message}` });
    }
}

const listarMascotas = async (req, res) => {
    try{
        // Validar roles
        let mascotas;
        if (req.usuario?.rol === "ADMINISTRADOR"){
            mascotas = await Mascota.find().select("-createdAt -updatedAt -__v").populate('owner_id', 'email nombre apellido telefono')
        }else if (req.usuario?.rol === "DUEÑO"){
            mascotas = await Mascota.find({owner_id: req.usuario._id})
        } else {
            return res.status(400).json({msg: "No tienes permisos para ver mascotas"})
        }
        // Enviar respuesta
        res.status(200).json(mascotas)
    }catch(error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

const detalleMascota = async (req, res) => {
    try{
        const {id} = req.params
        const rol = req.usuario.rol

        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({msg:`El ID ${id} no es válido`});
        }
        
        let mascota;
        if(rol === "ADMINISTRADOR"){
            mascota = await Mascota.findById(id).select("-createdAt -updatedAt -__v").populate('owner_id', 'email nombre apellido telefono')
            if(!mascota) return res.status(404).json({msg:`No existe la mascota ${id}`});
        }else if(rol === "DUEÑO"){
            mascota = await Mascota.findById(id).select("-createdAt -updatedAt -__v")
            if(mascota.owner_id._id.toString() !== req.usuario._id.toString()){
                return res.status(400).json({msg:"No puedes ver una mascota que no te pertenece."})
            }
        }
        else{
            return res.status(404).json({msg:`No tienes permisos para ver esta mascota.`});
        }

        res.status(200).json(mascota)

    }catch (error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

const actualizarMascota = async (req, res) => {
    try{
        const {id} = req.params
        const rol = req.usuario.rol

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:`El ID ${id} de la mascota no es válido`});
        if(!req.body || Object.keys(req.body).length === 0) return res.status(400).json({msg: "No se han enviado datos para actualizar."})

        let mascotaActualizar;
        if(rol === "ADMINISTRADOR"){
            const mascota = await Mascota.findById(id).select("-createdAt -updatedAt -__v").populate('owner_id', 'email nombre apellido telefono')
            if(!mascota) return res.status(404).json({msg:`No existe la mascota ${id}`});
            mascotaActualizar = mascota;
        }else if(rol === "DUEÑO"){
            mascotaActualizar = await Mascota.findById(id).select("-createdAt -updatedAt -__v")
            if(mascotaActualizar.owner_id._id.toString() !== req.usuario._id.toString()){
                return res.status(400).json({msg:"No puedes actualizar una mascota que no te pertenece."})
            }
        }else{
            return res.status(404).json({msg:`No tienes permisos para ver esta mascota.`});
        }

        const {nombre, tipo, raza, genero, tamano, color, fecha_nacimiento, descripcion, foto_principal} = req.body;

        if (nombre){
            if(!nombre.trim()){
                return res.status(400).json({ msg: "Los campos que quieres actualizar no pueden estar vacíos" });
            }
            mascotaActualizar.nombre = nombre.trim();
        }

        if (raza){
            if(!raza.trim()){
                return res.status(400).json({ msg: "Los campos que quieres actualizar no pueden estar vacíos" });
            }
            mascotaActualizar.raza = raza.trim();
        }

        if (color){
            if(!color.trim()){
                return res.status(400).json({ msg: "Los campos que quieres actualizar no pueden estar vacíos" });
            }
            mascotaActualizar.color = color.trim();
        }

        if (tipo){
            const tipoMayus = tipo.toUpperCase().trim()
            if (!["PERRO", "GATO", "OTRO"].includes(tipoMayus)){
                return res.status(400).json({msg:"Debes ingresar un tipo de mascota válido, ej: perro."})
            }
            mascotaActualizar.tipo = tipoMayus
        }

        if (genero){
            const generoMayus = genero.toUpperCase().trim()
            if (!["H", "M"].includes(generoMayus)){
                return res.status(400).json({msg:"Debes ingresar un género válido 'M' (MACHO) o 'H'(HEMBRA)"})
            }
            mascotaActualizar.genero = generoMayus
        }

        if (tamano){
            const tamanoMayus = tamano.toUpperCase().trim()
            if(!["PEQUEÑO","MEDIANO","GRANDE"].includes(tamanoMayus)){
                return res.status(400).json({msg:"Debes ingresar un tamaño válido 'PEQUEÑO', 'MEDIANO' o 'GRANDE'"})
            }
            mascotaActualizar.tamano = tamanoMayus
        }

        if (fecha_nacimiento){
            const fecha = new Date(fecha_nacimiento);
            const hoy = new Date();
            const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!fechaRegex.test(fecha_nacimiento)){
                return res.status(400).json({msg: "El formato de fecha no es válido, debe ser YYYY-MM-DD"})
            }
            if(fecha>hoy){
                return res.status(400).json({msg: "La fecha de nacimiento no puede ser en el futuro."})
            }
            mascotaActualizar.fecha_nacimiento = fecha_nacimiento;
        }

        // 4. Manejo de imagen (si el admin o dueño sube una foto)
        if (req.files?.foto_principal) {
            // Caso 1: archivo (multipart/form-data)
            const { secure_url } = await subirImagenCloudinary(
                req.files.foto_principal.tempFilePath,
                "Avatares-Mascotas"
            );
        
            mascotaActualizar.foto_principal = secure_url;
        
        } else if (req.body?.foto_principal && req.body.foto_principal.startsWith("data:image")) {
            // Caso 2: base64
            const secure_url = await subirBase64Cloudinary(
                req.body.foto_principal,
                "Avatares-Mascotas"
            );
        
            mascotaActualizar.foto_principal = secure_url;
        }

        await mascotaActualizar.save()
        res.status(200).json({msg:"Actualizaste la mascota con éxito", mascotaActualizar})
    }catch (error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

const actualizarDueno = async (req, res) => {
    try {
        const { id } = req.params; // ID de la mascota
        const rol = req.usuario.rol
        
        if(!req.body || Object.keys(req.body).length === 0) return res.status(400).json({msg: "No se han enviado datos para actualizar."})
        
        const { nuevoDuenoID } = req.body;

        if(rol !== "ADMINISTRADOR"){
            return res.status(400).json({msg:"No tienes permisos para actualizar el dueño de una mascota."})
        }

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:`El ID ${id} de la mascota no es válido`});
    
        if (!mongoose.Types.ObjectId.isValid(nuevoDuenoID)) {
            return res.status(400).json({ message: "El ID del dueño no es válido" });
        }
    
        // Buscar mascota
        const mascota = await Mascota.findById(id);
        if (!mascota) {
            return res.status(404).json({ message: "Mascota no encontrada" });
        }

        // Evitar mismo dueño
        if (mascota.owner_id.toString() === nuevoDuenoID) {
            return res.status(400).json({
            message: "La mascota ya pertenece a este dueño",
            });
        }
    
        // Buscar dueños
        const anteriorDueno = await Usuario.findById(mascota.owner_id);
        const nuevoDueno = await Usuario.findById(nuevoDuenoID);
    
        if (!anteriorDueno){
            return res.status(404).json({ message: "Dueño anterior no encontrado" });
        }
        if (!nuevoDueno) {
            return res.status(404).json({ message: "Nuevo dueño no encontrado" });
        }
    
        // Validar rol
        if (!nuevoDueno.rol.includes("DUEÑO")) {
            return res.status(400).json({
            message: "El usuario seleccionado no es un dueño válido",
            });
        }
    
        // Cambiar dueño
        mascota.owner_id = nuevoDuenoID;
        await mascota.save();
    
        // Enviar correos
        try {
            // await sendMailEliminarDuenoMascota(anteriorDueno.email, mascota.nombre);
    
            // await sendMailRegistroMascota(nuevoDueno.email, mascota.nombre);
        } catch (mailError) {
            console.error("Error enviando correos:", mailError.message);
        }
    
        res.json({msg: "Dueño de la mascota actualizado correctamente"});

    } catch (error) {
        res.status(500).json({message: `Error en el servidor - ${error}`});
    }
};

const eliminarMascota = async (req, res) => {
    try{
        const {id} = req.params
        const rol = req.usuario.rol

        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).json({msg:`El ID ${id} de la mascota no es válido`});
        
        const mascota = await Mascota.findById(id)
        if(!mascota) return res.status(400).json({msg:"No se ha encontrado la mascota."})

        if(rol === "ADMINISTRADOR"){
            mascota.estado = false;
            await mascota.save()
            res.status(200).json({msg:"Mascota desactivada correctamente"})
        }else if(rol === "DUEÑO"){
            if(mascota.owner_id._id.toString() !== req.usuario._id.toString()){
                return res.status(400).json({msg:"No puedes eliminar una mascota que no te pertenece."})
            }
            await Mascota.findByIdAndDelete(id)
            res.status(200).json({msg:"Mascota eliminada con éxito."}) //FALTA LOGICA DE SERVICIOS
        }else{
            return res.status(404).json({msg:`No tienes permisos para eliminar esta mascota.`});
        }

    }catch (error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

export {registroMascota,listarMascotas, detalleMascota, actualizarMascota, actualizarDueno, eliminarMascota}