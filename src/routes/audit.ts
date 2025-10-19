import express from "express";
import { authorize } from "../middlewares/auth.middleware.js";
import { authorizePermission } from "../middlewares/permissions.middleware.js";
import { auditController, metricsPrometheusController } from "../controllers/audit/audit.controller.js";

const router = express.Router();

router.get('/', authorize, authorizePermission("audit:read"), auditController);
router.get('/prometheus', authorize, authorizePermission('audit:read'), metricsPrometheusController);

export default router;