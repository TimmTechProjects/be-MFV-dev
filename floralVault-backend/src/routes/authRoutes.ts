import { Router } from "express";
import { loginUser, registerUser, googleLogin } from "../controllers/authController";
import { changeUsernameHandler } from "../controllers/userController";
import verifyToken from "../middleware/verifyToken";

const router = Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/google-login", googleLogin);
router.put("/change-username", verifyToken, changeUsernameHandler);

export default router;
