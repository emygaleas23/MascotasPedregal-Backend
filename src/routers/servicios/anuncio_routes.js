import {publicarAnuncio, listarAnuncios, detalleAnuncio, actualizarAnuncio, eliminarAnuncio, listarAnunciosPropios} from "../../controllers/servicios/anuncio_controller.js";
import { Router } from "express";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router()

router.post("/publicar", verifyToken, publicarAnuncio)
router.get("/listar", verifyToken, listarAnuncios)
router.get("/mis-anuncios", verifyToken, listarAnunciosPropios)
router.get("/detalle/:anuncio_id", verifyToken, detalleAnuncio)
router.patch("/actualizar/:anuncio_id", verifyToken, actualizarAnuncio)
router.delete("/eliminar/:anuncio_id",verifyToken,eliminarAnuncio)

export default router;