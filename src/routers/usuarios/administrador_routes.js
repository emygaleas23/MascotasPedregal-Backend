import { Router } from "express";
import { verifyToken } from "../../middlewares/JWT.js";
import { esAdmin } from "../../middlewares/rol.js";
import { actualizarUsuario, detalleUsuario, eliminarUsuario, listarUsuarios, registrarUsuario } from "../../controllers/usuarios/administrador_controller.js";

const router = Router()
router.use(verifyToken,esAdmin)

router.post("/registrarUsuario", registrarUsuario)

router.get("/usuarios", listarUsuarios)

router.get("/detalle-usuario/:id", detalleUsuario)

router.patch("/actualizar-usuario/:id", actualizarUsuario)

router.delete("/eliminar-usuario/:id",eliminarUsuario)


export default router;