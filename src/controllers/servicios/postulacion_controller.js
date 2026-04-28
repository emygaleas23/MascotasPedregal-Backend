import mongoose from "mongoose";
import Postulacion from "../../models/servicios/Postulacion.js";
import Anuncio from "../../models/servicios/Anuncio.js";
import Servcio from "../../models/servicios/Servcio.js";

// CUIDADOR
const postularAnuncio = async (req, res) => {
    try{
        // Usuario logueado
        const { _id: cuidador_id, rol } = req.usuario;

        if(rol !== "CUIDADOR"){
            return res.status(400).json({msg:"No tienes los permisos para postularte."})
        }

        // Anuncio
        const {anuncio_id} = req.params
        if (!mongoose.Types.ObjectId.isValid(anuncio_id)) return res.status(404).json({msg:"ID de anuncio inválido"})
        
        const anuncio = await Anuncio.findById(anuncio_id)
        if(!anuncio) return res.status(404).json({msg:"No se encontró el anuncio"})
        
        if(anuncio.estado !== "ABIERTO") return res.status(400).json({msg:"No puedes postularte a este anuncio, está cerrado."})
        
        // Evitar duplicados
        const existe = await Postulacion.findOne({
            anuncio_id,
            cuidador_id
        })

        if(existe){
            return res.status(400).json({msg:"Ya te has postulado a este anuncio."})
        }

        const postulacion = new Postulacion({
            anuncio_id, 
            cuidador_id
        })
        
        await postulacion.save()

        res.status(201).json({msg:"Te has postulado correctamente"})

    }catch(error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

// DUEÑO
// Solo el dueño que creó el anuncio, puede ver las postulaciones relacionadas a el
const listarPostulacionesPorAnuncio = async (req, res) => {
    try{
        // Usuario logueado
        const { _id: duenoID, rol } = req.usuario;

        if(rol !== "DUEÑO"){
            return res.status(400).json({msg:"No tienes permiso para ver las postulaciones de este anuncio."})
        }

        // Anuncio
        const {anuncio_id} = req.params
        if (!mongoose.Types.ObjectId.isValid(anuncio_id)) return res.status(404).json({msg:"ID de anuncio inválido"})
        
        const anuncio = await Anuncio.findById(anuncio_id)
        if(!anuncio) return res.status(404).json({msg:"No se encontró el anuncio"})
        
        if(anuncio.dueno_id.toString() !== duenoID.toString()) return res.status(403).json({ msg: "No puedes ver postulaciones de un anuncio que no es tuyo"});
        
        const postulaciones = await Postulacion.find({anuncio_id}).populate("cuidador_id", "nombre apellido email avatar_url")

        res.status(200).json(postulaciones);

    }catch(error){
        res.status(500).json({msg:`Error en el servidor - ${error}`})
    }
}

const aceptarPostulacion = async (req, res) => {
    try {
        const { _id: duenoID, rol } = req.usuario;

        if (rol !== "DUEÑO") {
            return res.status(403).json({ msg: "No tienes permisos para hacer esta acción." });
        }

        const { postulacion_id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(postulacion_id)) return res.status(400).json({ msg: "ID de postulación inválido" });

        const postulacion = await Postulacion.findById(postulacion_id);
        if (!postulacion) return res.status(404).json({ msg: "No existe la postulación" });
        if(postulacion.estado === "ACEPTADA") return res.status(400).json({ msg: "Esta postulación ya fue aceptada anteriormente" });

        const anuncio = await Anuncio.findById(postulacion.anuncio_id);
        if (!anuncio) return res.status(404).json({ msg: "No existe el anuncio" });

        // solo dueño del anuncio
        if (anuncio.dueno_id.toString() !== duenoID.toString()) return res.status(403).json({msg: "No puedes aceptar postulaciones de este anuncio"});

        if (anuncio.estado !== "ABIERTO") return res.status(400).json({msg: "El anuncio ya está cerrado"});

        // Evitar duplicar el servicio
        const existeServicio = await findOne({ anuncio_id: anuncio._id });
        if (existeServicio) return res.status(400).json({ msg: "Ya existe un servicio para este anuncio" });

        // 1. Aceptar esta postulación
        postulacion.estado = "ACEPTADA";
        await postulacion.save();

        // 2. Rechazar las demás
        await Postulacion.updateMany(
            {
                anuncio_id: anuncio._id,
                _id: { $ne: postulacion._id }
            },
            { estado: "RECHAZADA" }
        );

        // 3. cerrar anuncio y asignar cuidador
        anuncio.estado = "CERRADO";
        anuncio.cuidador_seleccionado = postulacion.cuidador_id;

        await anuncio.save();

        // 4. crear servicio
        const servicio = new Servicio({
            dueno_id: anuncio.dueno_id,
            cuidador_id: postulacion.cuidador_id,
            anuncio_id: anuncio._id,
            mascotas: anuncio.mascotas,
            servicios: anuncio.servicios,
            horario: anuncio.horario,
            estado: "ACTIVO"
        });
        
        await servicio.save();

        res.status(200).json({
            msg: "Postulación aceptada correctamente",
            postulacion,
            servicio
        });

    } catch (error) {
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

export {postularAnuncio, listarPostulacionesPorAnuncio, aceptarPostulacion}