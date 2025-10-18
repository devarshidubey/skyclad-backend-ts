import express from "express";
import { ocrController } from "../controllers/webhook/ocr.controller.js"
import { authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/ocr', authorize, ocrController);

export default router;