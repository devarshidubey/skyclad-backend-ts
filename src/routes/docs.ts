import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { createDocumentController, getDocumentController, updateDocumentController } from "../controllers/document/document.controller.js";
import { authorizePermission } from "../middlewares/permissions.middleware.js";

const router = express.Router();

router.get('/:documentId', authorize, authorizePermission("documents:read"), getDocumentController);
router.post('', authorize, authorizePermission("documents:create"), createDocumentController);
router.put('/:documentId', authorize, authorizePermission("documents:update"), updateDocumentController);
router.delete


export default router;