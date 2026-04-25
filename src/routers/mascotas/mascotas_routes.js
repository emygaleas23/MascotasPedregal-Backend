import { Router } from "express";
import { registroMascota, listarMascotas, detalleMascota, actualizarMascota, actualizarDueno, eliminarMascota } from "../../controllers/mascotas/mascotas_controller.js";
import { verifyToken } from "../../middlewares/JWT.js";
const router = Router()

router.post("/registro",verifyToken,registroMascota)

router.get("/listar",verifyToken,listarMascotas)

router.get("/detalle-mascota/:id",verifyToken,detalleMascota)

router.patch("/actualizar-mascota/:id", verifyToken, actualizarMascota)

router.patch("/actualizar-dueno/:id", verifyToken, actualizarDueno)

router.delete("/eliminar-mascota/:id",verifyToken, eliminarMascota)

export default router