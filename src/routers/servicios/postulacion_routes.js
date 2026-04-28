import { Router } from "express";
import { postularAnuncio, listarPostulacionesPorAnuncio, aceptarPostulacion } from "../../controllers/servicios/postulacion_controller.js";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router()

// CUIDADOR
router.post("/postular/:anuncio_id", verifyToken, postularAnuncio)

// DUEÑO
router.get("/listar/:anuncio_id", verifyToken, listarPostulacionesPorAnuncio)
router.patch("/aceptar-postulacion/:postulacion_id", verifyToken, aceptarPostulacion)

export default router;