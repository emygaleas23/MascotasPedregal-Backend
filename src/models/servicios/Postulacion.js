import { Schema, model } from "mongoose";

const postulacionSchema = new Schema({
    // Anuncio al que se postula
    anuncio_id: {
        type: Schema.Types.ObjectId,
        ref: "Anuncio",
        required: true
    },

    // Cuidador que se postula
    cuidador_id: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    tarifa_por_hora: {
        type: Number,
        required: true,
        min: 0
    },

    // Estado de la postulación
    estado: {
        type: String,
        enum: ["PENDIENTE", "ACEPTADA", "RECHAZADA"],
        default: "PENDIENTE"
    }

}, {
    timestamps: true
});

// Evitar que un cuidador se postule 2 veces al mismo anuncio
postulacionSchema.index({ anuncio_id: 1, cuidador_id: 1 }, { unique: true });

export default model("Postulacion", postulacionSchema);