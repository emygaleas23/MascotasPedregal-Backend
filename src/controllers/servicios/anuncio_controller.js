import Anuncio from "../../models/servicios/Anuncio.js";
import Mascota from "../../models/mascotas/Mascota.js";
import mongoose from "mongoose";

const publicarAnuncio = async (req, res) => {
    try{
        const { rol, _id: dueno_id } = req.usuario;

        if (rol !== "DUEÑO") {
            return res.status(403).json({ msg: "Solo los dueños pueden publicar anuncios." });
        }

        if(!req.body || Object.keys(req.body).length === 0) return res.status(400).json({msg: "La solicitud no puede estar vacía."})
        
        const { mascotas, descripcion, servicios, horario } = req.body;
        
        // MASCOTAS

        // 1. Verificar que las mascotas existan y pertenezcan al usuario
        if (!Array.isArray(mascotas) || mascotas.length === 0) {
            return res.status(400).json({ msg: "Debes enviar un arreglo de mascotas válido" });
        }

        const idsValidos = mascotas.every(id => mongoose.Types.ObjectId.isValid(id));
        if (!idsValidos) {
            return res.status(400).json({ msg: "Uno o más IDs de mascotas no son válidos" });
        }

        const mascotasValidas = await Mascota.find({
            _id: { $in: mascotas },
            owner_id: dueno_id
        });

        // Si la cantidad de mascotas encontradas es diferente a la cantidad enviada,
        // significa que alguna no existe o no pertenece al usuario
        if (mascotasValidas.length !== mascotas.length) {
            return res.status(400).json({ 
                msg: "Una o más mascotas no existen o no te pertenecen." 
            });
        }

        // DESCRIPCION
        const descripcionTrim = descripcion?.trim()
        if(!descripcionTrim){
            return res.status(400).json({msg:"La descripción es obligatoria"})
        }

        // SERVICIOS
        if (!Array.isArray(servicios)) {
            return res.status(400).json({ msg: "Los servicios deben ser un arreglo" });
        }
    
        const serviciosAnuncio = servicios
            .map(s => String(s).trim().toUpperCase())
            .filter(s => s.length > 0);
    
        if (serviciosAnuncio.length === 0) {
            return res.status(400).json({ msg: "Debes ingresar al menos un servicio válido" });
        }
    
        // HORARIO
        if (!horario || typeof horario !== "object") {
            return res.status(400).json({ msg: "Debes enviar un horario válido" });
        }

        const { dia, hora_desde, hora_hasta } = horario;

        if (!dia) {
            return res.status(400).json({ msg: "Debes ingresar un día" });
        }
        const diasPermitidos = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"];
        const diaTrim = dia.trim().toUpperCase();
        
        if(!diasPermitidos.includes(diaTrim)){
            return res.status(400).json({msg:"Debes ingresar un día válido: 'Lunes', 'Martes','Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'"})
        }
    
        // Validar horas
        if(!hora_desde || !hora_hasta) return res.status(400).json({ msg: "Debes ingresar hora desde y hasta" });

        const desde = String(hora_desde).trim()
        const hasta = String(hora_hasta).trim()
    
        // Validar formato simple HH:mm
        const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    
        if (!horaRegex.test(desde) || !horaRegex.test(hasta)) {
            return res.status(400).json({ msg: "Formato de hora inválido (HH:mm)" });
        }
    
        if (desde >= hasta) {
            return res.status(400).json({ msg: "La 'hora desde' debe ser menor que la 'hora hasta'" });
        }
    
        const horarioLimpio = {
            dia: diaTrim,
            hora_desde:desde,
            hora_hasta:hasta
        };

        // 2. Si pasa la validación, procedemos a crear
        const nuevoAnuncio = new Anuncio({
            dueno_id,
            mascotas,
            descripcion: descripcionTrim,
            servicios: serviciosAnuncio,
            horario: horarioLimpio
        });

        await nuevoAnuncio.save();
        res.status(201).json({ msg: "Anuncio publicado correctamente", anuncio: nuevoAnuncio });
        
    }catch(error){
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
}

const listarAnuncios = async (req, res) => {
    try{
        const anuncios = await Anuncio.find()
            .populate("mascotas")
            .populate("dueno_id", "nombre apellido");

        res.status(200).json(anuncios);
    }catch(error){
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
}

const detalleAnuncio = async (req, res) => {
    try{
        const { anuncio_id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(anuncio_id)) return res.status(404).json({ msg: "ID inválido" });

        const anuncio = await Anuncio.findById(anuncio_id).populate("mascotas");
        if (!anuncio) return res.status(404).json({ msg: "Anuncio no encontrado" });

        res.status(200).json(anuncio);
    }catch(error){
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
}

const actualizarAnuncio = async (req, res) => {
    try{
        const { anuncio_id } = req.params;
        const { _id: duenoID, rol } = req.usuario;

        if (rol !== "DUEÑO") {
            return res.status(403).json({ msg: "No tienes permisos para esta acción" });
        }

        if (!mongoose.Types.ObjectId.isValid(anuncio_id)) {
            return res.status(404).json({ msg: "ID inválido" });
        }

        const anuncio = await Anuncio.findById(anuncio_id);
        if (!anuncio) {
            return res.status(404).json({ msg: "Anuncio no encontrado" });
        }

        // VERIFICAR ROL
        if (anuncio.dueno_id.toString() !== duenoID.toString()) {
            return res.status(403).json({ msg: "No tienes permiso para modificar este anuncio" });
        }

        if (anuncio.estado === "CERRADO") {
            return res.status(400).json({ msg: "No puedes modificar un anuncio ya cerrado" });
        }

        const { descripcion, servicios, horario, mascotas } = req.body;

        // DESCRIPCIÓN
        if (descripcion !== undefined) {
            const descripcionTrim = descripcion.trim();
            if (!descripcionTrim) {
                return res.status(400).json({ msg: "La descripción no puede estar vacía" });
            }
            anuncio.descripcion = descripcionTrim;
        }

        // SERVICIOS
        if (servicios !== undefined) {
            if (!Array.isArray(servicios)) {
                return res.status(400).json({ msg: "Los servicios deben ser un arreglo" });
            }

            const serviciosLimpios = servicios
                .map(s => String(s).trim().toUpperCase())
                .filter(s => s.length > 0);

            if (serviciosLimpios.length === 0) {
                return res.status(400).json({ msg: "Debes ingresar al menos un servicio válido" });
            }

            anuncio.servicios = serviciosLimpios;
        }

        // MASCOTAS
        if (mascotas !== undefined) {
            if (!Array.isArray(mascotas) || mascotas.length === 0) {
                return res.status(400).json({ msg: "Debes enviar un arreglo de mascotas válido" });
            }

            const idsValidos = mascotas.every(id => mongoose.Types.ObjectId.isValid(id));
            if (!idsValidos) {
                return res.status(400).json({ msg: "Uno o más IDs de mascotas no son válidos" });
            }

            const mascotasValidas = await Mascota.find({
                _id: { $in: mascotas },
                owner_id: duenoID
            });

            if (mascotasValidas.length !== mascotas.length) {
                return res.status(400).json({ 
                    msg: "Una o más mascotas no existen o no te pertenecen." 
                });
            }

            anuncio.mascotas = mascotas;
        }

        // HORARIO
        if (horario !== undefined) {
            if (typeof horario !== "object") {
                return res.status(400).json({ msg: "Debes enviar un horario válido" });
            }

            const { dia, hora_desde, hora_hasta } = horario;

            if (!dia) {
                return res.status(400).json({ msg: "Debes ingresar un día" });
            }

            const diasPermitidos = ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"];
            const diaTrim = dia.trim().toUpperCase();

            if (!diasPermitidos.includes(diaTrim)) {
                return res.status(400).json({ msg: "Día inválido" });
            }

            if (!hora_desde || !hora_hasta) {
                return res.status(400).json({ msg: "Debes ingresar hora desde y hasta" });
            }

            const desde = String(hora_desde).trim();
            const hasta = String(hora_hasta).trim();

            const horaRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

            if (!horaRegex.test(desde) || !horaRegex.test(hasta)) {
                return res.status(400).json({ msg: "Formato de hora inválido (HH:mm)" });
            }

            if (desde >= hasta) {
                return res.status(400).json({ msg: "La hora desde debe ser menor que la hora hasta" });
            }

            anuncio.horario = {
                dia: diaTrim,
                hora_desde: desde,
                hora_hasta: hasta
            };
        }

        await anuncio.save();

        res.status(200).json({
            msg: "Anuncio actualizado correctamente",
            anuncio
        });

    }catch(error){
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

const eliminarAnuncio = async (req, res) => {
    try{
        const { anuncio_id } = req.params;
        const { _id: duenoID } = req.usuario;

        const anuncio = await Anuncio.findById(anuncio_id);
        if (!anuncio) return res.status(404).json({ msg: "Anuncio no encontrado" });

        if (anuncio.dueno_id.toString() !== duenoID.toString()) {
            return res.status(403).json({ msg: "No tienes permiso para eliminar este anuncio" });
        }

        if (anuncio.estado === "CERRADO"){
            return res.status(400).json({msg: "No puedes eliminar un anuncio CERRADO"})
        }

        await Anuncio.findByIdAndDelete(anuncio_id);
        res.status(200).json({ msg: "Anuncio eliminado correctamente" });
    }catch(error){
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
}
export {publicarAnuncio, listarAnuncios, detalleAnuncio, actualizarAnuncio, eliminarAnuncio}