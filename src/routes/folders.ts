import express from "express"
import { authorize } from "../middlewares/auth.middleware.js";
import { listTags, findDocuments, createTagController } from "../controllers/tag/tag.controller.js";
import { authorizePermission } from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.get('/', authorize, authorizePermission("tags:read"), listTags);
router.post('/', authorize, authorize, createTagController);
router.get('/:tag/docs', authorize, authorizePermission("documents:read"), findDocuments);

export default router;