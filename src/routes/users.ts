import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { assignRole } from "../controllers/user/user.controller.js";

const router = express.Router();

router.put('/assignRole/:id', authorize, assignRole);

export default router;