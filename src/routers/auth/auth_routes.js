import { Router } from "express";
import { registrarUsuario, confirmarEmail } from "../../controllers/auth/auth_controller";
import { verifyToken } from "../../middlewares/JWT";

const router = Router();

router.post("/registro", registrarUsuario);
router.get("/confirmar-email/:token", confirmarEmail);

export default router;