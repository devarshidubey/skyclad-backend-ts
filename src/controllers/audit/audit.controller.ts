import type { Request, Response, NextFunction } from "express";
import HTTPError from "../../utils/HTTPError.js";
import { fetchMetrics } from "../../services/audit/audit.service.js";
import { getLatestMetricsJSON, getPrometheusMetrics } from '../../services/audit/metrics.service.js';


export const auditController = (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json(getLatestMetricsJSON());
    } catch (err) {
        next(err);
    }
};

export const metricsPrometheusController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const metrics = await getPrometheusMetrics();
        res.set('Content-Type', 'text/plain; version=0.0.4');
        res.send(metrics);
    } catch (err) {
        next(err);
    }
};
