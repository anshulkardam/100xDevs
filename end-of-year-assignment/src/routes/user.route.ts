import { Router } from "express";
import { getUser, loginUser, registerUser } from "../controllers/user.cont";

const router = Router();

router.post("/signup", registerUser);

router.post("/login", loginUser);

router.get("/me", getUser);

export default router;
