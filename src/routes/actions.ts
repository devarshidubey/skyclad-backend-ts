import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { runAction, usageController } from "../controllers/action/action.controller.js";
import { authorizePermission } from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.post('/run', authorize, runAction);
router.get('/usage/month', authorize, authorizePermission("actions:usage"), usageController)

export default router;