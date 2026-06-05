import {Router} from "express";
import { ejecutarRecordatoriosCompromisos} from "./cronNotificaciones.js";

const router = Router();

router.get("/recordatorios-compromisos", async (req, res) => {
    try {
        await ejecutarRecordatoriosCompromisos();

        res.status(200).json({
            msg: "Recordatorios procesados correctamente"
        });
    } catch (error) {
        console.error("Error en ruta cron:", error);

        res.status(500).json({
            msg: "Error al procesar recordatorios"
        });
    }
});

export default router;