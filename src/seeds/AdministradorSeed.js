import Usuario from "../models/usuarios/Usuario.js";

const crearAdmin = async () => {
    try {
        const existe = await Usuario.findOne({ rol: "ADMINISTRADOR" });

        if (existe) {
            console.log("Ya existe un administrador");
            return;
        }

        const admin = new Usuario({
            rol: "ADMINISTRADOR",
            nombre: process.env.ADMIN_NOMBRE,
            apellido: process.env.ADMIN_APELLIDO,
            email: process.env.ADMIN_EMAIL,
            password: process.env.ADMIN_PASSWORD, // se encripta solo con el pre("save")
            telefono:process.env.ADMIN_TELEFONO,
            verificado: true
        });

        await admin.save();

        console.log("Administrador creado correctamente");
    } catch (error) {
        console.log("Error creando admin:", error.message);
    }
};

export default crearAdmin;