import { Router } from "express";
import { actualizarPerfil, actualizarPortada, listarCuidadores, obtenerCuidador } from "../../controllers/usuarios/cuidador_controller.js";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router()

router.get("/listar-cuidadores", verifyToken, listarCuidadores)
router.get("/detalle-cuidador/:cuidador_id", verifyToken, obtenerCuidador)
router.patch("/actualizar-perfil", verifyToken, actualizarPerfil)
router.patch("/actualizar-portada",verifyToken, actualizarPortada)

export default router;