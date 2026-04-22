import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const usuarioSchema = new mongoose.Schema({
    // Rol del usuario: ADMINISTRADOR, DUEÑO o CUIDADOR
    rol:{
        type:String,
        enum:["ADMINISTRADOR", "DUEÑO", "CUIDADOR"],
        required:true
    },
    // Email del usuario, debe ser único
    email:{
        type:String,
        required:true,
        unique:true
    },
    // Google ID del usuario, debe ser único (inicio de sesión con Google)
    googleId:{
        type:String,
        unique:true,
        sparse:true // Permite múltiples documentos sin googleId
    },
    // Estado de verificación del usuario, por defecto es false
    verificado:{
        type:Boolean,
        default:false
    },
    // Contraseña del usuario, se encripta antes de guardarla
    password:{
        type:String,
        required:true
    },
    // Token que permite: verificación de email, recuperación de contraseña, etc. Se genera con crypto y se guarda en la base de datos
    token:{
        type:String,
        default:null,
        trim:true
    },
    // Estado del usuario, por defecto es true (activo), para borrado lógico se cambia a false
    estado:{
        type:Boolean,
        default:true,
        required:true
    },
    // Información personal del usuario
    informacionPersonal:{
        nombre:{
            type:String,
            required:true,
            trim:true
        },
        apellido:{
            type:String,
            required:true,
            trim:true
        },
        telefono:{
            type:String,
            required:true,
            trim:true,
            unique:true,
        },
        fechaNacimiento:{
            type:Date
        },
        avatar_url:{
            type:String,
            trim:true
        },
    }
},{
    timestamps:true
})

// Hash antes de guardar el usuario, se encripta la contraseña
usuarioSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Comparar la contraseña ingresada con la contraseña almacenada en la base de datos
usuarioSchema.methods.matchPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Token seguro para verificación
usuarioSchema.methods.createToken = function () {
    const token = crypto.randomBytes(32).toString("hex");
    this.token = token;
    return token;
}

export default model("Usuario", usuarioSchema);