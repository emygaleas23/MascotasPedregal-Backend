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
        fecha_inicio: Date,
        fecha_fin: Date
    },
    
    // Precio que debe pagar el dueño por el servicio/s
    tarifa_por_hora: {
        type: Number,
        required: true
    },
    horas: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
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

servicioSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

export default model("Servicio", servicioSchema)