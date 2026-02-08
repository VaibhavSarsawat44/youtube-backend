import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router();

// 👇 FINAL PART
router.post("/register", registerUser);

export default router;