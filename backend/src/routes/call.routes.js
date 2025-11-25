import express from "express";
import { initiateCall, getCallHistory } from "../controllers/call.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/", protectRoute, initiateCall);
router.get("/", protectRoute, getCallHistory);

export default router;
