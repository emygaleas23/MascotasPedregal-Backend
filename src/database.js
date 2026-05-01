import mongoose from "mongoose";
import dotenv from "dotenv";
import crearAdmin from "./seeds/AdministradorSeed.js";

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
    } catch (error) {
        console.log("Error al conectar la base de datos:", error);
    }
};

export default connection;