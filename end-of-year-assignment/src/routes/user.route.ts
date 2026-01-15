import { Router } from "express";
import { getUser, loginUser, registerUser } from "../controllers/user.cont";
import { authenticate } from "../middleware/authenticate";
import { ValidatePayload } from "../middleware/validatePayload";
import { userLoginValidator, userRegisterValidator } from "../validators/user";

const router = Router();

router.post("/signup", ValidatePayload(userRegisterValidator), registerUser);

router.post("/login", ValidatePayload(userLoginValidator), loginUser);

router.get("/me", authenticate, getUser);

export default router;
