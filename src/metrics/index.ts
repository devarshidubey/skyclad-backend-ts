import client from 'prom-client';
import { getTotalDocs, getTotalFolders, getTotalTasks, getTotalActions } from '../services/audit/audit.service.js';

// Create gauges
export const docsGauge = new client.Gauge({ name: 'docs_total', help: 'Total documents' });
export const foldersGauge = new client.Gauge({ name: 'folders_total', help: 'Total folders' });
export const tasksGauge = new client.Gauge({ name: 'tasks_today', help: 'Tasks created today' });
export const actionsGauge = new client.Gauge({ name: 'actions_month', help: 'Actions this month' });

// Refresh function
export const refreshMetrics = async () => {
  try {
    docsGauge.set(await getTotalDocs());
    foldersGauge.set(await getTotalFolders());
    tasksGauge.set(await getTotalTasks());
    actionsGauge.set(await getTotalActions());
  } catch (err) {
    console.error('Failed to refresh metrics:', err);
  }
};

// Start periodic refresh every 10s (or any interval)
setInterval(refreshMetrics, 10_000);
refreshMetrics(); // initial refresh
