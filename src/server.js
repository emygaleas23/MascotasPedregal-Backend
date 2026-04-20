
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';

// Inicializaciones
const app = express()
dotenv.config()

// Configuraciones 
app.use(cors())
app.set('port',process.env.PORT || 3000)

// Middlewares 
app.use(express.json())

// Rutas 
app.get('/',(req,res)=> res.send("Server on"))


export default  app