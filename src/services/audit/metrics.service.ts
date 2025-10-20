import client from 'prom-client';
import { getTotalDocs, getTotalFolders, getTotalTasks, getTotalActions } from './audit.service.js';

let latestMetrics: Record<string, number> = {};

export const docsGauge = new client.Gauge({ name: 'docs_total', help: 'Total documents' });
export const foldersGauge = new client.Gauge({ name: 'folders_total', help: 'Total folders' });
export const tasksGauge = new client.Gauge({ name: 'tasks_today', help: 'Tasks created today' });
export const actionsGauge = new client.Gauge({ name: 'actions_month', help: 'Actions this month' });

export const refreshMetrics = async () => {
    try {
        const docs = await getTotalDocs();
        const folders = await getTotalFolders();
        const tasks = await getTotalTasks();
        const actions = await getTotalActions();

        docsGauge.set(docs);
        foldersGauge.set(folders);
        tasksGauge.set(tasks);
        actionsGauge.set(actions);

        latestMetrics = { docs_total: docs, folders_total: folders, tasks_today: tasks, actions_month: actions };
    } catch (err) {
        console.error('Metrics refresh failed:', err);
    }
};

setInterval(refreshMetrics, 10_000);
refreshMetrics();

export const getLatestMetricsJSON = () => latestMetrics;

export const getPrometheusMetrics = async (): Promise<string> => {
    return await client.register.metrics();
};
