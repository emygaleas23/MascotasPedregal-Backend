import { Schema, model } from "mongoose";

const anuncioSchema = new Schema({
    // Dueño que crea el anuncio
    dueno_id: {
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
        fecha_inicio: {
            type: Date,
            required: true
        },
        fecha_fin: {
            type: Date,
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

anuncioSchema.pre("save", function(next) {
    if (this.horario.fecha_fin <= this.horario.fecha_inicio) {
        return next(new Error("La fecha_fin debe ser mayor a fecha_inicio"));
    }
    next();
});

anuncioSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

export default model("Anuncio", anuncioSchema);