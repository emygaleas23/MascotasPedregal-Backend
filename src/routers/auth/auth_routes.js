import { Router } from "express";
import { registrarUsuario, confirmarEmail, loginUsuario } from "../../controllers/auth/auth_controller.js";
import { verifyToken } from "../../middlewares/JWT.js";

const router = Router();

router.post("/registro", registrarUsuario);
router.get("/confirmar-email/:token", confirmarEmail);
router.post("/login", loginUsuario);

export default router;