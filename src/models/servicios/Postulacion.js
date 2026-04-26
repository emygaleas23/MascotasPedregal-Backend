import { Schema, model } from "mongoose";

const postulacionSchema = new Schema({
    // Anuncio al que se postula
    anuncio: {
        type: Schema.Types.ObjectId,
        ref: "Anuncio",
        required: true
    },

    // Cuidador que se postula
    cuidador: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
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
postulacionSchema.index({ anuncio: 1, cuidador: 1 }, { unique: true });

export default model("Postulacion", postulacionSchema);