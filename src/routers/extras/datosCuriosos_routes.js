import { getRandomFact } from "../../controllers/extras/datosCuriosos_controller.js";
import { Router } from "express"

const router = Router()

router.get("/datos-curiosos", getRandomFact);

export default router