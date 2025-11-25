import express from "express";
import { register, login, logout, updateProfile, checkAuth, getAllUsers } from "../controllers/auth.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/signup", register);
router.post("/login", login);
router.post("/logout", logout);

router.put("/profile", protectRoute, updateProfile);

router.get("/check", protectRoute, checkAuth);
router.get("/users", protectRoute, getAllUsers);

export default router;
