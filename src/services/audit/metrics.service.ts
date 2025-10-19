import client from 'prom-client';
import { getTotalDocs, getTotalFolders, getTotalTasks, getTotalActions } from './audit.service.js';

// In-memory metrics store for JSON API
let latestMetrics: Record<string, number> = {};

// Prometheus Gauges
export const docsGauge = new client.Gauge({ name: 'docs_total', help: 'Total documents' });
export const foldersGauge = new client.Gauge({ name: 'folders_total', help: 'Total folders' });
export const tasksGauge = new client.Gauge({ name: 'tasks_today', help: 'Tasks created today' });
export const actionsGauge = new client.Gauge({ name: 'actions_month', help: 'Actions this month' });

// Refresh metrics
export const refreshMetrics = async () => {
    try {
        const docs = await getTotalDocs();
        const folders = await getTotalFolders();
        const tasks = await getTotalTasks();
        const actions = await getTotalActions();

        // Update Prometheus gauges
        docsGauge.set(docs);
        foldersGauge.set(folders);
        tasksGauge.set(tasks);
        actionsGauge.set(actions);

        // Update in-memory JSON store
        latestMetrics = { docs_total: docs, folders_total: folders, tasks_today: tasks, actions_month: actions };
    } catch (err) {
        console.error('Metrics refresh failed:', err);
    }
};

// Start periodic refresh
setInterval(refreshMetrics, 10_000);
refreshMetrics();

// Controllers can access this
export const getLatestMetricsJSON = () => latestMetrics;

// Prometheus exposition
export const getPrometheusMetrics = async (): Promise<string> => {
    return await client.register.metrics();
};
