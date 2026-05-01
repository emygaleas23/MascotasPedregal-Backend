import { Router } from "express";
import { crearCompromiso, listarCompromisos, detalleCompromiso, completarCompromiso, eliminarCompromiso } from "../../controllers/compromisos_sanitarios/compromisos_sanitarios_controller.js";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router()

router.post("/crear", verifyToken, crearCompromiso);
router.get("/listar", verifyToken, listarCompromisos);
router.get("/detalle/:id", verifyToken, detalleCompromiso);
router.patch("/completar/:id", verifyToken, completarCompromiso);
router.delete("/eliminar/:id", verifyToken, eliminarCompromiso);

export default router