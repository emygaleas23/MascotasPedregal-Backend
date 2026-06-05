import Usuario from "../models/usuarios/Usuario.js";

const crearDueno = async () => {
    try {
        const dueno = new Usuario({
            rol: "DUEÑO",
            nombre: process.env.DUENO_NOMBRE,
            apellido: process.env.DUENO_APELLIDO,
            email: process.env.DUENO_EMAIL,
            password: process.env.DUENO_PASSWORD, // se encripta solo con el pre("save")
            telefono:process.env.DUENO_TELEFONO,
            verificado: true
        });

        await dueno.save();

        console.log("Dueño creado correctamente");
    } catch (error) {
        console.log("Error creando dueño:", error.message);
    }
};

export default crearDueno;