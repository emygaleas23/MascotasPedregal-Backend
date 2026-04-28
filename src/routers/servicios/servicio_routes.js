import { Router } from "express";
import { obtenerServicios, actualizarEstadoServicio, detalleServicio, listarMascotasAsignadas } from "../../controllers/servicios/servicio_controller";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router()

router.get("/listar", verifyToken, obtenerServicios)
router.get("/mascotas-asignadas", verifyToken, listarMascotasAsignadas)
router.get("/detalle/:servicio_id", verifyToken, detalleServicio)
router.patch("/actualizar-servicio/:servicio_id", verifyToken, actualizarEstadoServicio)

export default router;