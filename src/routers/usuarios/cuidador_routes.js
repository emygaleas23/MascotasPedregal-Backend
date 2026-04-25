import { Router } from "express";
import { actualizarPerfil, actualizarPortada, listarCuidadores } from "../../controllers/usuarios/cuidador_controller.js";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router()

router.get("/listar-cuidadores",listarCuidadores)

export default router;