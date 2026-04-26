import mongoose from "mongoose";
import Cuidador from "../../models/usuarios/Cuidador.js";
import { subirBase64Cloudinary, subirImagenCloudinary } from "../../helpers/uploadCloudinary.js";

const actualizarPerfil = async (req, res) => {
    try{
        const {id} = req.usuario
        const {biografia, tarifa_hora, servicios_ofrecidos, horario_disponible} = req.body;
        const rol = req.usuario.rol
        
        if(!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({msg: "ID de usuario no válido"})
        if(rol !== "CUIDADOR"){
            return res.status(400).json({msg:"No tienes los permisos necesarios para actualizar el perfil 'Cuidador'"})
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ msg: "Debes enviar datos para actualizar" });
        }

        const cuidador = await Cuidador.findOne({usuario: id})
        if(!cuidador){
            const perfilCuidador = new Cuidador({
                usuario: req.usuario._id,
                tarifa_hora:0,
                servicios_ofrecidos: [],
                biografia: "",
            })
            await perfilCuidador.save()
        }

        if(biografia !== undefined){
            const biografiaTrim = biografia.trim()
            if(!biografiaTrim){
                return res.status(400).json({ msg: "La biografía no puede estar vacía." });
            }
            cuidador.biografia = biografiaTrim
        }

        if(tarifa_hora !== undefined){
            const tarifa = Number(tarifa_hora)
            if(isNaN(tarifa)){
                return res.status(400).json({ msg: "La tarifa debe ser un número válido" });
            }

            if(tarifa<0){
                return res.status(400).json({msg:"La tarifa no puede ser negativa."})
            }

            cuidador.tarifa_hora = tarifa
        }

        if(servicios_ofrecidos !==undefined){
            if (!Array.isArray(servicios_ofrecidos)) {
                return res.status(400).json({ msg: "Los servicios deben ser un arreglo" });
            }
        
            const servicios = servicios_ofrecidos
                .map(s => String(s).trim().toUpperCase())
                .filter(s => s.length > 0);
        
            if (servicios.length === 0) {
                return res.status(400).json({ msg: "Debes ingresar al menos un servicio válido" });
            }
            cuidador.servicios_ofrecidos = servicios;
        }

        if (horario_disponible && typeof horario_disponible === "object") {

            const { dia, hora_desde, hora_hasta } = horario_disponible;
        
            // Validar días
            if (!Array.isArray(dia) || dia.length === 0) {
                return res.status(400).json({ msg: "Debes ingresar al menos un día disponible" });
            }
        
            // Limpiar días
            const diasPermitidos = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"];
            const diasValidos = dia.map(d => d.trim().toUpperCase());
            const diasInvalidos = diasValidos.filter(d => !diasPermitidos.includes(d));
            if (diasInvalidos.length > 0) return res.status(400).json({ msg: "Solo debes ingresar días válidos: 'Lunes', 'Martes','Miercoles', 'Jueves', 'Viernes'" });
        
            // Validar horas
            const desde = hora_desde.trim()
            const hasta = hora_hasta.trim()

            if (!desde || !hasta) {
                return res.status(400).json({ msg: "Debes ingresar hora desde y hasta" });
            }
        
            // Validar formato simple HH:mm
            const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        
            if (!horaRegex.test(desde) || !horaRegex.test(hasta)) {
                return res.status(400).json({ msg: "Formato de hora inválido (HH:mm)" });
            }
        
            // Validar lógica (desde < hasta)
            if (desde >= hasta) {
                return res.status(400).json({ msg: "La 'hora desde' debe ser menor que la 'hora hasta'" });
            }
        
            cuidador.horario_disponible = {
                dia: diasValidos,
                hora_desde:desde,
                hora_hasta:hasta
            };
        }

        await cuidador.save()
        res.status(200).json({
            msg:"Perfil actualizado correctamente",
            cuidador
        });
        
    } catch (error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

const actualizarPortada = async (req, res) =>{
    try{
        const id = req.usuario?._id;
        // Validar ID
        if( !mongoose.Types.ObjectId.isValid(id) ) return res.status(404).json({msg:`ID inválido ${id}`})

        // IMAGEN
        const imagenFile = req.files?.portada_url;
        const imagenBase64 = req.body?.portada_url

        // Validara que venga algo
        if (!imagenFile && !imagenBase64) {
            return res.status(400).json({ msg: "No se ha proporcionado ninguna imagen" });
        }

        // Validar que el cuidador exista
        const cuidador = await Cuidador.findOne({usuario: id});
        if (!cuidador) return res.status(404).json({ msg: "Cuidador no encontrado" });

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

        cuidador.portada_url = secure_url;
        await cuidador.save()

        res.status(200).json({msg:"Portada actualizada correctamente", "portada_url": secure_url})
    }catch (error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

const listarCuidadores = async(req, res) =>{
    try{
        const cuidadores = await Cuidador.find().populate({
            path:"usuario",
            match:{estado:true},
            select: "nombre apellido email telefono avatar_url"
        })
        if(cuidadores.length === 0) return res.status(200).json({msg:"No existen cuidadores registrados."})
        res.status(200).json(cuidadores)
    }catch(error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

export {actualizarPerfil, actualizarPortada, listarCuidadores}