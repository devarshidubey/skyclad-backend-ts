import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { assignRole, getUsersController } from "../controllers/user/user.controller.js";
import { authorizePermission } from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.get('/', authorize, authorizePermission("users:read"), getUsersController);
router.put('/assignRole/:id', authorize, authorizePermission("access:update"), assignRole);

export default router;