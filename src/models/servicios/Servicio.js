import { Schema, model } from "mongoose";

const servicioSchema = new Schema({
    dueno_id:{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    // cuidador asignado después de aceptar su postulación en el anuncio
    cuidador_id:{
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    // Anuncio relacionado
    anuncio_id:{
        type: Schema.Types.ObjectId,
        ref: "Anuncio",
        required: true
    },
    // Mascotas relacionadas (puede ser una o varias)
    mascotas: [{
        type: Schema.Types.ObjectId,
        ref: "Mascota",
        required: true
    }],
    // Servicios solicitados
    servicios: [{
        type: String,
        trim: true
    }],
    // Horario requerido
    horario: {
        dia: {
            type: String,
            enum: ["LUNES","MARTES","MIERCOLES","JUEVES","VIERNES","SABADO","DOMINGO"],
            required: true
        },
        hora_desde: {
            type: String,
            required: true
        },
        hora_hasta: {
            type: String,
            required: true
        }
    },

    // Estado del servicio
    estado: {
        type: String,
        enum: ["PENDIENTE","ACTIVO", "FINALIZADO", "CANCELADO"],
        default: "PENDIENTE"
    },
},{
    timestamps:true
})
export default model("Servicio", servicioSchema)