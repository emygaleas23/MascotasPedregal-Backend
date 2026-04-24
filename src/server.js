
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

// Importar rutas de autenticación
import authRoutes from "./routers/auth/auth_routes.js";

// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders:['Content-Type', 'Authorization']
}))
app.set('port',process.env.PORT || 3000)

// Middlewares 
app.use(express.json())

// Rutas 
app.get('/',(req,res)=> res.send("Server on"))

// Rutas de autenticación y perfil
app.use("/api/auth", authRoutes);

// Manejo de una ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ msg: "Ruta no encontrada" });
});

export default  app