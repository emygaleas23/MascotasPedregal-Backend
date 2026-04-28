import Servcio from "../../models/servicios/Servicio.js";
import mongoose from "mongoose";

const obtenerServicios = async (req, res) => {
    try{
        const { _id: usuarioID, rol } = req.usuario;

        let servicios;
        if(rol === "DUEÑO"){
            servicios = await Servcio.find({dueno_id: usuario})
                .populate("cuidador_id", "nombre apellido email telefono avatar_url")
                .populate("mascotas")
        } else if (rol === "CUIDADOR"){
            servicios = await Servcio.find({cuidador_id:usuario})
                .populate("dueno_id", "nombre apellido email telefono avatar_url")
                .populate("mascotas");
        }else{ return res.status(403).json({ msg: "No tienes permisos para ver servicios" });}

        if (servicios.length === 0) {
            return res.status(200).json({ msg: "No tienes servicios asignados", servicios: [] });
        }

        res.status(200).json(servicios);
    } catch(error){
        res.status(500).json({ msg: `Error en el servidor - ${error}` })
    }
}

const actualizarEstadoServicio = async (req, res) => {
    try {
        const { _id: usuarioID, rol } = req.usuario;
        const { id } = req.params;
        const { estado } = req.body;

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: "ID de servicio inválido" });
        }

        const servicio = await Servicio.findById(id);

        if (!servicio) {
            return res.status(404).json({ msg: "Servicio no encontrado" });
        }

        // Validar que sea dueño o cuidador del servicio
        const esDueno = servicio.dueno_id.toString() === usuarioID.toString();
        const esCuidador = servicio.cuidador_id.toString() === usuarioID.toString();

        if (!esDueno && !esCuidador) {
            return res.status(403).json({ msg: "No tienes permisos para modificar este servicio" });
        }

        // Validar estado
        if (!estado) {
            return res.status(400).json({ msg: "Debes enviar un estado" });
        }
        
        const estadoServicio = estado.trim().toUpperCase();
        const estadosValidos = ["ACTIVO", "FINALIZADO", "CANCELADO"];

        if (!estadosValidos.includes(estadoServicio)) {
            return res.status(400).json({ msg: "Estado inválido" });
        }

        // Evitar cambios innecesarios
        if (servicio.estado === estadoServicio) {
            return res.status(400).json({ msg: `El servicio ya está en estado ${estadoServicio}` });
        }

        // Evitar que un rol no permitido cambie de estado
        if (rol === "CUIDADOR" && estadoServicio === "CANCELADO") {
            return res.status(403).json({ msg: "El cuidador no puede cancelar el servicio" });
        }
        
        if (rol === "DUEÑO" && estadoServicio === "FINALIZADO") {
            return res.status(403).json({ msg: "El dueño no puede finalizar el servicio" });
        }

        // Evitar reactivar servicios finalizados o cancelados
        if (servicio.estado === "FINALIZADO") {
            return res.status(400).json({ msg: "No puedes modificar un servicio finalizado" });
        }
        if (servicio.estado === "CANCELADO") {
            return res.status(400).json({ msg: "No puedes modificar un servicio cancelado" });
        }

        servicio.estado = estadoServicio;
        await servicio.save();

        res.status(200).json({
            msg: "Estado del servicio actualizado correctamente",
            servicio
        });

    } catch (error) {
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};