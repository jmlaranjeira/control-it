import { Router } from 'express';
import { getStats } from '../utils/cache.js';
import { performDependencyHealthCheck } from '../utils/dependencyManager.js';
import { recordError, getMetrics, register } from '../utils/metrics.js';
import { getBackupStats } from '../utils/backup.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

router.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date().toISOString() });
});

router.get('/health/ready', async (req, res) => {
  try {
    const config = await import('../config.js');
    if (config.default.apiBaseUrl) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: { config: 'loaded', external_api: 'configured' },
      });
    } else {
      res.status(503).json({ status: 'not ready', timestamp: new Date().toISOString(), message: 'Configuration not complete' });
    }
  } catch (error) {
    res.status(503).json({ status: 'not ready', timestamp: new Date().toISOString(), message: 'Service unavailable', error: error.message });
  }
});

router.get('/health/cache', (req, res) => {
  const stats = getStats();
  res.status(200).json({
    status: 'cache_stats',
    timestamp: new Date().toISOString(),
    cache: { ...stats, hitRatePercentage: Math.round(stats.hitRate * 100 * 100) / 100 },
  });
});

router.get('/health/dependencies', async (req, res) => {
  try {
    const healthCheck = performDependencyHealthCheck();
    const statusCode = healthCheck.overall.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({ status: 'dependency_health', timestamp: new Date().toISOString(), ...healthCheck });
  } catch (error) {
    recordError('dependency_check', req.path);
    res.status(500).json({ status: 'dependency_health_error', timestamp: new Date().toISOString(), error: error.message });
  }
});

router.get('/health/backups', (req, res) => {
  try {
    res.status(200).json({ status: 'backup_stats', timestamp: new Date().toISOString(), ...getBackupStats() });
  } catch (error) {
    recordError('backup_stats', req.path);
    res.status(500).json({ status: 'backup_stats_error', timestamp: new Date().toISOString(), error: error.message });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await getMetrics());
  } catch (error) {
    recordError('metrics_endpoint', req.path);
    res.status(500).end('# Error generating metrics\n');
  }
});

export default router;
