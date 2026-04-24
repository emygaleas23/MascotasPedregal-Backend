// Requerir Módulos
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

// Importar rutas de autenticación
import authRoutes from "./routers/auth/auth_routes.js";

// Importar cloudinary y fileUpload para imágenes
import cloudinary from 'cloudinary';
import fileUpload from 'express-fileupload';

// Importar rutas de administrador
import adminRoutes from "./routers/usuarios/administrador_routes.js"

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

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})


// Middlewares 
app.use(express.json())
app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:'/tmp/',
    createParentPath:true
}));

// Rutas 
app.get('/',(req,res)=> res.send("Server on"))

// Rutas de autenticación y perfil
app.use("/api/auth", authRoutes);

// Rutas de administrador
app.use("/api/administrador",adminRoutes);


// Manejo de una ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ msg: "Ruta no encontrada" });
});

export default  app