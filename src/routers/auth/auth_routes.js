import { Router } from "express";
import { registrarUsuario, confirmarEmail, loginUsuario, reestablecerPassword, comprobarTokenPassword, crearNuevoPassword, detallesPerfil, actualizarPerfil, actualizarFotoPerfil, actualizarPassword } from "../../controllers/auth/auth_controller.js";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router();

router.post("/registro", registrarUsuario);
router.get("/confirmar-email/:token", confirmarEmail);

router.post("/reestablecer-password", reestablecerPassword);
router.get("/reestablecer-password/:token", comprobarTokenPassword);
router.post("/crear-nuevo-password/:token", crearNuevoPassword);

router.post("/login", loginUsuario);

router.get("/perfil", verifyToken, detallesPerfil);

router.patch("/perfil", verifyToken, actualizarPerfil);
router.patch("/perfil-foto", verifyToken, actualizarFotoPerfil);

router.put('/actualizar-password',verifyToken,actualizarPassword)

export default router;