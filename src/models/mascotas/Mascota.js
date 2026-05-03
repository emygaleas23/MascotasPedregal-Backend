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
            enum:["PERRO", "GATO", "OTRO"],
            required: true
        },
        raza: {
            type: String,
            trim:true
        },
        genero: {
            type: String,
            enum: ["M", "H"],
        },
        tamano: {
            type: String,
            enum: ["PEQUEÑO", "MEDIANO", "GRANDE"]
        },
        color: {
            type: String,
            trim:true
        },
        fecha_nacimiento: {
            type: Date
        },
        foto_principal: {
            type: String,
            trim:true
        },
        descripcion: {
            type: String,
            trim: true
        },
        estado:{
            type:Boolean,
            default:true,
            required:true
        },
    },
    {
        timestamps:true
    }
)

mascotaSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        return ret;
    }
});

export default model("Mascota", mascotaSchema)