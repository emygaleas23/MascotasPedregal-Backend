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
        required: true,
    },
    servicios_ofrecidos: [String],
    horario_disponible: {
        dia: [{
            type: String,
            enum: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]
        }],
        hora_desde: String,
        hora_hasta: String,
    },
    estado:{
        type:Boolean,
        default:true,
        required:true
    },
},
{
    timestamps: true
});

cuidadorSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

export default model("Cuidador", cuidadorSchema);
