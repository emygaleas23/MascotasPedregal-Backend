import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config()

mongoose.set('strictQuery', true);

const connection = async () => {
    try {
        const {connection} = await mongoose.connect(process.env.MONGODB_URI_ATLAS)
        console.log(`Conexión a la base de datos exitosa en "${connection.host} - ${connection.port}"`)
    } catch (error) {
        console.log("Error al conectar a la base de datos:", error)
    }
}

export default connection;