import {Schema, model} from "mongoose";

const mascotaSchema = new Schema(
    {
        owner_id:{
            type: Schema.Types.ObjectId,
            ref:"Usuario",
            required: true
        },
        nombre: {
            type: String,
            required: true,
            trim: true
        },
        tipo: {
            type: String,
            enum:["Perro", "Gato", "Otro"],
            required: true
        },
        raza: {
            type: String
        },
        genero: {
            type: String,
            enum: ["M", "H"]
        },
        tamano: {
            type: String,
            enum: ["Pequeño", "Mediano", "Grande"]
        },
        color: {
            type: String
        },
        fecha_nacimiento: {
            type: Date
        },
        foto_principal: {
            type: String
        },
        descripcion: {
            type: String
        }
    },
    {
        timestamps:true
    }
)

export default model("Mascota", mascotaSchema)