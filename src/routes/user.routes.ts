import { Router } from "express";
import { getUserById, healthCheck } from "../controllers/user.controller";

const router = Router();

router.get('/health', healthCheck);
router.get('/users/:id', getUserById);

export default router;