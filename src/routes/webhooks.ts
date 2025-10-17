import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use('/ocr', authorize, );

export default router;