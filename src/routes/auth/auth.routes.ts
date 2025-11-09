import { Router } from "express";
import { login } from "../../controllers/auth/login.controller";
import { refreshAccessToken } from "../../controllers/auth/refreshToken.controller";

const router = Router();

router.post("/login", login);
router.post("/refresh-token", refreshAccessToken);

export default router;
