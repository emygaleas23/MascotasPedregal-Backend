import { Router } from "express";
import { crearResena, editarResena, obtenerResena, obtenerResenasCuidador } from "../../controllers/servicios/resena_controller.js";

import { verifyToken } from "../../middlewares/JWT.js";

const router = Router();

router.post("/crear/:id_servicio", verifyToken, crearResena);

router.put("/editar/:id_resena", verifyToken, editarResena);

router.get("/detalle/:id_resena", verifyToken, obtenerResena);

router.get( "/:id_usuario_cuidador", verifyToken, obtenerResenasCuidador );

export default router;