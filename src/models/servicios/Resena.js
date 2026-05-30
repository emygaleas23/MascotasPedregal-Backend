import { Schema, model } from "mongoose";

const resenaSchema = new Schema({
    servicio_id: {
        type: Schema.Types.ObjectId,
        ref: "Servicio",
        required: true,
        unique: true
    },
    dueno_id: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    cuidador_id: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true
    },
    calificacion: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comentario: {
        type: String,
        trim: true,
        required: true,
        minLength:10,
        maxlength: 300
    }
}, {
    timestamps: true
});

resenaSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

export default model("Resena", resenaSchema);