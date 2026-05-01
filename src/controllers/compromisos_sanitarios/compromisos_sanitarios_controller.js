import compromisoSanitario from "../../models/compromisos_sanitarios/compromisoSanitario.js";
import Mascota from "../../models/mascotas/Mascota.js";
import mongoose from "mongoose";

const crearCompromiso = async (req, res) => {
    try{
        // Validar campos
        if(!req.body || Object.keys(req.body).length === 0) return res.status(400).json({msg: "La solicitud no puede estar vacía."})
        const {mascota_id, tipo, descripcion, proxima_fecha} = req.body
        const { _id: usuarioID, rol } = req.usuario;

        // Validar rol
        if (rol !== "DUEÑO"){
            return res.status(403).json({msg:"Solo un dueño puede crear compromisos sanitarios de sus mascotas."})
        }

        // Validar id mascota
        if (!mongoose.Types.ObjectId.isValid(mascota_id)){
            return res.status(404).json({msg:"El ID de la mascota no es válido"});
        }

        // Validar que el usuario logueado sea el dueño de la mascota
        const mascota = await Mascota.findOne({_id: mascota_id, owner_id : usuarioID})
        if (!mascota){
            return res.status(404).json({msg:"No eres dueño de esta mascota"})
        }

        
        if(!mascota_id || !tipo || !proxima_fecha){
            return res.status(400).json({msg:"Debes enviar datos en los campos de mascota_id, tipo y proxima_fecha"})
        }
        
        const tiposValidos = ["VACUNA", "DESPARASITACION", "CONTROL", "OTRO"];
        const tipoV = tipo.trim().toUpperCase()
        if (!tiposValidos.includes(tipoV)) {
            return res.status(400).json({ msg: "Estado inválido" });
        }

        // Validar que la fecha sea futura
        const fecha = new Date(proxima_fecha)
        const hoy = new Date();

        if (isNaN(fecha.getTime())){
            return res.status(400).json({msg:"Fecha inválida"})
        }

        if (fecha <= hoy) {
            return res.status(400).json({
                msg: "La fecha debe ser futura"
            });
        }

        // Crear compromiso
        const compromiso = new compromisoSanitario({
            mascota_id,
            tipo: tipoV,
            descripcion,
            proxima_fecha: fecha
        })

        await compromiso.save()

        res.status(201).json({msg: "Compromiso creado correctamente", compromiso})

    }catch (error){
        res.status(500).json({msg: `Error en el servidor - ${error.message}`});
    }    
}

const listarCompromisos = async (req, res) => {
    try {
        const { _id: usuarioID, rol } = req.usuario;
        const { estado } = req.query

        // Validar rol
        if(rol !== "DUEÑO"){
            return res.status(403).json({msg:"Solo un dueño puede acceder a los compromisos sanitarios de sus mascotas."})
        }
        
        // Obtener mascotas del dueño
        const mascotas = await Mascota.find({ owner_id: usuarioID }).select("_id");

        const mascotasIDs = mascotas.map(m => m._id);

        let filtro = {
            mascota_id: { $in: mascotasIDs }
        };

        if (estado) {
            filtro.estado = estado.toUpperCase();
        }

        const compromisos = await compromisoSanitario.find(filtro)
            .populate("mascota_id", "nombre tipo")
            .sort({ fecha_proxima: 1 });

        if (compromisos.length === 0){
            res.status(500).json({msg: "No existen compromisos registrados."});
        }
        res.status(200).json(compromisos);
    } catch (error) {
        res.status(500).json({msg: `Error en el servidor - ${error.message}`});
    }
}

const detalleCompromiso = async (req, res) => {
    try {
        const { _id: usuarioID, rol } = req.usuario;
        const { id } = req.params;

        if(rol !== "DUEÑO"){
            return res.status(403).json({ msg: "No tienes permisos suficientes para visualizar esto." });
        }

        // Validar id 
        if (!mongoose.Types.ObjectId.isValid(id)){
            return res.status(404).json({msg:"El ID no es válido"});
        }

        const compromiso = await compromisoSanitario.findById(id).populate("mascota_id")

        if (!compromiso) {
            return res.status(404).json({ msg: "Compromiso sanitario no encontrado" });
        }

        if(compromiso.mascota_id.owner_id.toString() !== usuarioID.toString()){
            return res.status(403).json({ msg: "No tienes eres dueño de esta mascota." });
        }

        res.status(200).json(compromiso);

    } catch (error) {
        res.status(500).json({msg: `Error en el servidor - ${error.message}`});
    }
};

const completarCompromiso = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: usuarioID, rol } = req.usuario;

        if(rol !== "DUEÑO"){
            return res.status(403).json({ msg: "No tienes los permisos necesarios" });
        }

        const compromiso = await compromisoSanitario.findById(id);
        if (!compromiso) {
            return res.status(404).json({ msg: "No encontrado" });
        }

        const mascota = await Mascota.findById(compromiso.mascota_id);

        if (mascota.owner_id.toString() !== usuarioID.toString()) {
            return res.status(403).json({
                msg: "No puedes modificar este compromiso"
            });
        }

        if (compromiso.estado === "COMPLETADO") {
            return res.status(400).json({
                msg: "Ya está completado"
            });
        }

        compromiso.estado = "COMPLETADO";
        compromiso.fecha_completado = new Date()
        await compromiso.save();

        res.status(200).json({
            msg: "Compromiso completado",
            compromiso
        });

    } catch (error) {
        res.status(500).json({msg: `Error en el servidor - ${error.message}`});
    }
};

const eliminarCompromiso = async (req, res) => {
    try {
        const { id } = req.params;
        const { _id: usuarioID, rol } = req.usuario;

        if(rol !== "DUEÑO"){
            return res.status(403).json({ msg: "No tienes los permisos necesarios" });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID inválido" });
        }

        const compromiso = await compromisoSanitario.findById(id).populate("mascota_id");
        
        if (!compromiso) {
            return res.status(404).json({ msg: "Compromiso sanitario no encontrado" });
        }

        if (compromiso.mascota_id.owner_id.toString() !== usuarioID.toString()) {
            return res.status(403).json({
                msg: "No puedes modificar este compromiso"
            });
        }

        await compromiso.deleteOne();

        res.status(200).json({
            msg: "Compromiso eliminado correctamente"
        });

    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

export {crearCompromiso, listarCompromisos, detalleCompromiso, completarCompromiso, eliminarCompromiso}