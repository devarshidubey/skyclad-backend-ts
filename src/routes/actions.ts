import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { runAction } from "../controllers/action/action.controller.js";

const router = express.Router();

router.post('/run', authorize, runAction);

export default router;