import app from './server.js'
import connection from './database.js'

// Iniciar el servidor
(async ()=>{
    try{
        await connection();
        const port = app.get("port") || 3000;
        app.listen(port,()=>{
            console.log(
                `Ejecutándose en: http://localhost:${port}`
            )
        });
    } catch (error){
        console.error("❌ Error al iniciar servidor:", error);
        process.exit(1);
    }
})();