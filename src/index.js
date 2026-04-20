import app from './server.js'
import connection from './database.js'

// Iniciar el servidor

app.listen(app.get('port'),()=>{
    console.log(`Servidor iniciado en el puerto ${app.get('port')}`)
})

// Conectar a la base de datos
connection()