import Usuario from "../models/usuarios/Usuario.js";
import Cuidador from "../models/usuarios/Cuidador.js";

const crearCuidador = async () => {
    try {
        const cuidador = new Usuario({
            rol: "CUIDADOR",
            nombre: process.env.CUIDADOR_NOMBRE,
            apellido: process.env.CUIDADOR_APELLIDO,
            email: process.env.CUIDADOR_EMAIL,
            password: process.env.CUIDADOR_PASSWORD, // se encripta solo con el pre("save")
            telefono:process.env.CUIDADOR_TELEFONO,
            verificado: true
        });

        const usuarioGuardado = await cuidador.save();

        // Crear perfil de cuidador asociado
        const perfilCuidador = new Cuidador({
            usuario: usuarioGuardado._id,
            tarifa_hora: 1,
            servicios_ofrecidos: ["Paseo"],
            biografia: "Cuidador por defecto creado automáticamente.",
            portada_url: "",
            horario_disponible: {
                dia: ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"],
                hora_desde: "08:00",
                hora_hasta: "16:00"
            }
        });

        await perfilCuidador.save();

        console.log("Cuidador creado correctamente");
    } catch (error) {
        console.log("Error creando cuidador:", error.message);
    }
};

export default crearCuidador;