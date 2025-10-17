import express from "express"
import { authorize } from "../middlewares/auth.middleware.js";
import { listTags, findDocuments } from "../controllers/tag/tag.controller.js";

const router = express.Router();

router.get('/', authorize, listTags);
router.get('/:tag/docs', authorize, findDocuments)

export default router;