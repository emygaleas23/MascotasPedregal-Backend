import { Schema, model } from "mongoose";

const anuncioSchema = new Schema({
    // Dueño que crea el anuncio
    dueno: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },

    // Mascotas relacionadas (puede ser una o varias)
    mascotas: [{
        type: Schema.Types.ObjectId,
        ref: "Mascota",
        required: true
    }],

    // Descripción del anuncio
    descripcion: {
        type: String,
        required: true,
        trim: true
    },

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

    // Estado del anuncio
    estado: {
        type: String,
        enum: ["ABIERTO", "CERRADO"],
        default: "ABIERTO"
    },

    // Cuidador seleccionado (cuando el dueño elige uno)
    cuidador_seleccionado: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        default: null
    }

}, {
    timestamps: true
});

export default model("Anuncio", anuncioSchema);