import mongoose from "mongoose";
import dotenv from "dotenv";
import crearAdmin from "./seeds/AdministradorSeed.js";
import crearDueno from "./seeds/DuenoSeed.js";
import crearCuidador from "./seeds/CuidadorSeed.js";

dotenv.config()

mongoose.set('strictQuery', true);

const connection = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI_ATLAS);
        console.log("Conexión a la base de datos exitosa");
        // Ejecutar seed administrador
        try {
            await crearAdmin();
        } catch (error) {
            console.error("Error en seed admin:", error.message);
        }
        // Ejecutar seed dueño
        try {
            await crearDueno();
        } catch (error) {
            console.error("Error en seed dueño:", error.message);
        }
        // Ejecutar seed cuidador
        try {
            await crearCuidador();
        } catch (error) {
            console.error("Error en seed cuidador:", error.message);
        }
    } catch (error) {
        console.log("Error al conectar la base de datos:", error);
    }
};

export default connection;