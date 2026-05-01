import { Schema, model } from "mongoose";

const compromisoSchema = new Schema({
    // Mascota relacionada
    mascota_id: {
        type: Schema.Types.ObjectId,
        ref: "Mascota",
        required: true
    },

    // Tipo de compromiso
    tipo: {
        type: String,
        enum: ["VACUNA", "DESPARASITACION", "CONTROL", "OTRO"],
        required: true
    },

    // Descripción opcional
    descripcion: {
        type: String,
        trim: true
    },

    // Fecha en la que debe cumplirse
    proxima_fecha: {
        type: Date,
        required: true
    },

    // Fecha en que se cumplió
    fecha_completado:{
        type:Date,
        default: null
    },

    // Estado del compromiso
    estado: {
        type: String,
        enum: ["PENDIENTE", "COMPLETADO"],
        default: "PENDIENTE"
    },

    // Envío de recordatorios
    recordatorios_enviados: {
        type: [Number], // [7, 3, 0] días
        default: []
    }

}, {
    timestamps: true
});

export default model("compromisoSanitario", compromisoSchema);