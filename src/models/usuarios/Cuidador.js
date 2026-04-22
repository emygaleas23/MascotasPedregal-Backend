import { model, Schema } from "mongoose";

const cuidadorSchema = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "Usuario",
        required: true,
        unique: true
    },
    biografia: {
        type: String,
        trim: true
    },
    portada_url: {
        type: String,
        trim: true
    },
    tarifa_hora: {
        type: Number,
        trim: true
    },
    servicios_ofrecidos: [String],
    horario_disponible: {
        dias: [{
            type: String,
            enum: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]
        }],
        hora_desde: {type: String, trim: true},
        hora_hasta: {type: String, trim: true},
    }
}, { _id: false });

export default model("Cuidador", cuidadorSchema);
