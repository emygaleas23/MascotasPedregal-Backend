import mongoose from "mongoose";
import Resena from "../../models/servicios/Resena.js";
import Servicio from "../../models/servicios/Servicio.js";

const crearResena = async (req, res) => {
    try {
        const { id_servicio } = req.params;
        const { calificacion, comentario } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id_servicio)) {
            return res.status(400).json({
                msg: "El ID del servicio no es válido."
            });
        }

        const calificacionNumero = Number(calificacion);

        if (!Number.isInteger(calificacionNumero)) {
            return res.status(400).json({
                msg: "La calificación debe ser un número entero."
            });
        }

        if (calificacionNumero < 1 || calificacionNumero > 5) {
            return res.status(400).json({
                msg: "La calificación debe estar entre 1 y 5."
            });
        }

        if (!comentario || typeof comentario !== "string") {
            return res.status(400).json({
                msg: "El comentario de la reseña es obligatorio."
            });
        }

        const comentarioLimpio = comentario.trim();

        if (comentarioLimpio.length < 10) {
            return res.status(400).json({
                msg: "El comentario debe tener al menos 10 caracteres."
            });
        }

        if (comentarioLimpio.length > 300) {
            return res.status(400).json({
                msg: "El comentario no puede superar los 300 caracteres."
            });
        }

        const servicio = await Servicio.findById(id_servicio);

        if (!servicio) {
            return res.status(404).json({
                msg: "Servicio no encontrado."
            });
        }

        if (servicio.dueno_id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                msg: "No tienes permisos para reseñar este servicio."
            });
        }

        if (servicio.estado !== "FINALIZADO") {
            return res.status(400).json({
                msg: "Solo se puede reseñar un servicio finalizado."
            });
        }

        const existeResena = await Resena.findOne({
            servicio_id: servicio._id
        });

        if (existeResena) {
            return res.status(400).json({
                msg: "Este servicio ya tiene una reseña registrada."
            });
        }

        const nuevaResena = new Resena({
            servicio_id: servicio._id,
            dueno_id: servicio.dueno_id,
            cuidador_id: servicio.cuidador_id,
            calificacion: calificacionNumero,
            comentario: comentarioLimpio
        });

        await nuevaResena.save();

        return res.status(201).json({ msg: "Reseña registrada correctamente."});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error al registrar la reseña."
        });
    }
};

const obtenerResena = async (req, res) => {
    try {
        const { id_resena } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id_resena)) return res.status(400).json({ msg: "ID de reseña no válido." });

        const resena = await Resena.findById(id_resena)
            .populate("dueno_id", "nombre apellido")
            .populate("cuidador_id", "nombre apellido");

        if (!resena) {
            return res.status(404).json({
                msg: "Reseña no encontrada."
            });
        }

        return res.status(200).json(resena);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error al obtener la reseña."
        });
    }
};

const obtenerResenasCuidador = async (req, res) => {
    try {
        const { id_usuario_cuidador } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id_usuario_cuidador)) return res.status(400).json({ msg: "ID de cuidador no válido." });

        const cuidador = await Servicio.findOne({ cuidador_id: id_usuario_cuidador });
        if (!cuidador) return res.status(404).json({ msg: "Cuidador no encontrado." });

        const resenas = await Resena.find({
            cuidador_id: id_usuario_cuidador
        })
        .populate("dueno_id", "nombre apellido avatar_url")
        .sort({ createdAt: -1 });

        if (resenas.length === 0) return res.status(200).json({msg: "No hay reseñas para este cuidador."})

        const total_resenas = resenas.length;

        const promedio_calificacion = total_resenas > 0
            ? resenas.reduce((acc, resena) => acc + resena.calificacion, 0) / total_resenas
            : 0;

        return res.status(200).json({
            total_resenas,
            promedio_calificacion: Number(promedio_calificacion.toFixed(1)),
            resenas
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error al obtener las reseñas del cuidador."
        });
    }
};

const editarResena = async (req, res) => {
    try {
        const { id_resena } = req.params;
        const { comentario, calificacion } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id_resena)) {
            return res.status(400).json({
                msg: "El ID de la reseña no es válido."
            });
        }
        
        const resena = await Resena.findById(id_resena);

        if (!resena) {
            return res.status(404).json({
                msg: "Reseña no encontrada."
            });
        }

        if (resena.dueno_id.toString() !== req.usuario._id.toString()) {
            return res.status(403).json({
                msg: "No tienes permisos para editar esta reseña."
            });
        }

        if (calificacion) {
            if (!Number.isInteger(Number(calificacion))) {
                return res.status(400).json({
                    msg: "La calificación debe ser un número entero."
                });
            }

            if (calificacion < 1 || calificacion > 5) {
                return res.status(400).json({
                    msg: "La calificación debe estar entre 1 y 5."
                });
            }

            resena.calificacion = calificacion;
        }

        if (comentario) {
            const comentarioLimpio = comentario.trim();

            if (comentarioLimpio.length < 10) {
                return res.status(400).json({
                    msg: "El comentario debe tener al menos 10 caracteres."
                });
            }

            if (comentarioLimpio.length > 300) {
                return res.status(400).json({
                    msg: "El comentario no puede superar los 300 caracteres."
                });
            }

            resena.comentario = comentarioLimpio;
        }

        await resena.save();

        return res.status(200).json({msg: "Reseña actualizada correctamente."});

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            msg: "Error al actualizar la reseña."
        });
    }
};

export { crearResena, obtenerResena, obtenerResenasCuidador, editarResena };