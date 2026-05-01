import Servicio from "../../models/servicios/Servicio.js";
import mongoose from "mongoose";
import Mascota from "../../models/mascotas/Mascota.js";
import { sendMailEstadoServicio } from "../../helpers/sendMail.js";

const obtenerServicios = async (req, res) => {
    try{
        const { _id: usuarioID, rol } = req.usuario;

        let servicios;
        if(rol === "DUEÑO"){
            servicios = await Servicio.find({dueno_id: usuarioID})
                .populate("cuidador_id", "nombre apellido email telefono avatar_url")
                .populate("mascotas")
        } else if (rol === "CUIDADOR"){
            servicios = await Servicio.find({cuidador_id:usuarioID})
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

const detalleServicio = async (req, res) => {
    try{
        const { _id: usuarioID, rol } = req.usuario;
        const {servicio_id} = req.params

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(servicio_id)) {
            return res.status(400).json({ msg: "ID de servicio inválido" });
        }

        const servicio = await Servicio.findById(servicio_id);

        if (!servicio) {
            return res.status(404).json({ msg: "Servicio no encontrado" });
        }

        // Validar que sea dueño o cuidador del servicio
        const esDueno = servicio.dueno_id.toString() === usuarioID.toString();
        const esCuidador = servicio.cuidador_id.toString() === usuarioID.toString();

        let servicios;
        if(rol === "DUEÑO"){
            servicios = await Servicio.findById(servicio_id)
                .populate("cuidador_id", "nombre apellido email telefono avatar_url")
                .populate("mascotas")
        } else if (rol === "CUIDADOR"){
            servicios = await Servicio.find(servicio_id)
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
        const { servicio_id } = req.params;
        const { estado } = req.body;

        // Validar ID
        if (!mongoose.Types.ObjectId.isValid(servicio_id)) {
            return res.status(400).json({ msg: "ID de servicio inválido" });
        }

        const servicio = await Servicio.findById(servicio_id)
            .populate("dueno_id", "email nombre")
            .populate("cuidador_id", "email nombre")
            .populate("mascotas", "nombre");

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

        // Enviar email
        const correoDueno = servicio.dueno_id.email;
        const correoCuidador = servicio.cuidador_id.email;
        const nombresMascotas = servicio.mascotas.map(m => m.nombre).join(", ");
        const serviciosTexto = servicio.servicios.join(", ");
        const fechaInicio = servicio.horario.fecha_inicio;
        const fechaFin = servicio.horario.fecha_fin;

        try {
            await sendMailEstadoServicio(correoCuidador, correoDueno, nombresMascotas, serviciosTexto, fechaInicio, fechaFin, estadoServicio)
        } catch (error) {
            console.error("Error enviando correo:", error)
        }

        res.status(200).json({
            msg: "Estado del servicio actualizado correctamente",
            servicio
        });

    } catch (error) {
        res.status(500).json({ msg: `Error en el servidor - ${error}` });
    }
};

const listarMascotasAsignadas = async (req, res) => {
    try {
        const { _id: cuidadorID, rol } = req.usuario;

        // Validar rol
        if (rol !== "CUIDADOR") {
            return res.status(403).json({
                msg: "Solo los cuidadores pueden ver mascotas asignadas"
            });
        }

        // Buscar servicios
        const servicios = await Servicio.find({
            cuidador_id: cuidadorID,
        });

        if (servicios.length === 0) {
            return res.status(200).json({
                msg: "No tienes mascotas asignadas actualmente",
                mascotas: []
            });
        }

        // Obtener IDs únicos de mascotas
        const mascotasIDs = [
            ...new Set(
                servicios.flatMap(s =>
                    s.mascotas.map(id => id.toString())
                )
            )
        ];

        // Buscar mascotas
        const mascotas = await Mascota.find({
            _id: { $in: mascotasIDs }
        }).populate('owner_id', 'nombre apellido email telefono');

        res.status(200).json({
            total: mascotas.length,
            mascotas
        });

    } catch (error) {
        res.status(500).json({
            msg: `Error en el servidor - ${error.message}`
        });
    }
};

export {obtenerServicios, listarMascotasAsignadas, detalleServicio, actualizarEstadoServicio}