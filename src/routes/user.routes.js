import { Router } from "express";
import { registerUser, deleteAllUsers, loginUser, logoutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// 👇 FINAL PART
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1
    },
    {
      name: "coverImage",
      maxCount: 1
    }
  ]),
  registerUser
);

router.route("/login").post(loginUser);

// router.route("/delete-all").delete(deleteAllUsers);
// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
export default router;