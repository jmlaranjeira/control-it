import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { DateTime } from 'luxon';
import fs from 'fs';
import https from 'https';
import { submitHoursRange, getRegisteredDaysFromReport, getRegisteredDays } from './logic.js';
import { errorHandler, notFound, catchAsync, validateDateRange } from './middleware/errorHandler.js';
import { logRequest } from './utils/logger.js';
import { apiLimiter, submitLimiter } from './middleware/rateLimiter.js';
import { getStats } from './utils/cache.js';
import { del as cacheDel, cacheKeys, flushAll as cacheFlushAll, getKeys as cacheGetKeys } from './utils/cache.js';
import { performDependencyHealthCheck } from './utils/dependencyManager.js';
import { metricsMiddleware, getMetrics, recordError, recordApiCall, register } from './utils/metrics.js';
import { scheduleBackups, getBackupStats } from './utils/backup.js';
import { initDatabase, healthCheck as dbHealthCheck, auditLogs } from './utils/database.js';

// Placeholder for holiday checking logic
async function checkIfHoliday(date) {
  // Implement holiday logic here. For now, return false.
  return false;
}

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/ready', async (req, res) => {
  try {
    // Check if we can connect to external services
    // For now, just check if config is loaded
    const config = await import('./config.js');

    if (config.default.username && config.default.password) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        services: {
          config: 'loaded',
          database: 'N/A', // No database in this app
          external_api: 'configured',
        },
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        message: 'Configuration not complete',
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      message: 'Service unavailable',
      error: error.message,
    });
  }
});

app.get('/health/cache', (req, res) => {
  const stats = getStats();
  res.status(200).json({
    status: 'cache_stats',
    timestamp: new Date().toISOString(),
    cache: {
      ...stats,
      hitRatePercentage: Math.round(stats.hitRate * 100 * 100) / 100, // Convert to percentage with 2 decimals
    },
  });
});

app.get('/health/dependencies', async (req, res) => {
  try {
    const healthCheck = performDependencyHealthCheck();
    const statusCode = healthCheck.overall.status === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      status: 'dependency_health',
      timestamp: new Date().toISOString(),
      ...healthCheck
    });
  } catch (error) {
    recordError('dependency_check', req.path);
    res.status(500).json({
      status: 'dependency_health_error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/health/backups', (req, res) => {
  try {
    const backupStats = getBackupStats();
    res.status(200).json({
      status: 'backup_stats',
      timestamp: new Date().toISOString(),
      ...backupStats
    });
  } catch (error) {
    recordError('backup_stats', req.path);
    res.status(500).json({
      status: 'backup_stats_error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/health/database', async (req, res) => {
  try {
    const dbHealth = await dbHealthCheck();
    const statusCode = dbHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      status: 'database_health',
      timestamp: new Date().toISOString(),
      database: dbHealth
    });
  } catch (error) {
    recordError('database_health', req.path);
    res.status(500).json({
      status: 'database_health_error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await getMetrics());
  } catch (error) {
    recordError('metrics_endpoint', req.path);
    res.status(500).end('# Error generating metrics\n');
  }
});

// Metrics middleware (must be first)
app.use(metricsMiddleware);

// Request logging middleware
app.use(logRequest);

// Rate limiting middleware
app.use('/submit', submitLimiter);
app.use(apiLimiter);


app.get('/', catchAsync(async (req, res) => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), 0, 1);

  const startISO = startDate.toISOString().slice(0, 10);
  const endISO = today.toISOString().slice(0, 10);

  const registered = await getRegisteredDays(startISO, endISO);
  const calendarData = [];
  let cursor = new Date(startDate);
  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    const day = cursor.getDay();
    const find = registered.find(r => r.date === iso);
    if ((day >= 1 && day <= 5) || find?.isHoliday) {
      const isHoliday = !!find?.isHoliday;
      calendarData.push({
        date: iso,
        status: isHoliday ? 'holiday' : (find?.status || 'pending'),
        isHoliday,
      });
    }
    cursor.setHours(12);
    cursor.setDate(cursor.getDate() + 1);
  }

  res.render('index', { results: [], calendarData, startDate: '', endDate: '', isLoading: true });
}));

app.post('/submit', validateDateRange, catchAsync(async (req, res) => {
  const { dryRun } = req.body;
  const { startISO, endISO } = req.validatedDates;

  // Log audit event
  if (dbInitialized) {
    await auditLogs.log('hours_submitted', {
      startDate: startISO,
      endDate: endISO,
      dryRun: dryRun === 'on',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  }

  const results = await submitHoursRange({
    startDate: startISO,
    endDate: endISO,
    dryRun: dryRun === 'on',
  });

  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const calendarStartISO = yearStart.toISOString().slice(0, 10);
  const calendarEndISO = today.toISOString().slice(0, 10);

  // Invalidate cached registered days so the UI reflects fresh data
  try {
    cacheDel(cacheKeys.registeredDays(startISO, endISO));
    cacheDel(cacheKeys.registeredDays(calendarStartISO, calendarEndISO));
  } catch {}
  const registered = await getRegisteredDays(calendarStartISO, calendarEndISO);

  const calendarData = [];
  let cursor = new Date(yearStart);
  while (cursor <= today) {
    const iso = cursor.toISOString().slice(0, 10);
    const day = cursor.getDay();
    const find = registered.find(r => r.date === iso);

    if ((day >= 1 && day <= 5) || find?.isHoliday) {
      const isHoliday = !!find?.isHoliday;
      calendarData.push({
        date: iso,
        status: isHoliday ? 'holiday' : (find?.status || 'pending'),
        isHoliday,
      });
    }
    cursor.setHours(12);
    cursor.setDate(cursor.getDate() + 1);
  }

  res.render('index', { calendarData, results, startDate: startISO, endDate: endISO, isLoading: false });
}));

// Simple cache admin endpoints (optional)
app.get('/cache/keys', (req, res) => {
  res.json({ keys: cacheGetKeys() });
});

app.get('/cache/stats', (req, res) => {
  res.json({ stats: getStats() });
});

app.post('/cache/flush', (req, res) => {
  cacheFlushAll();
  res.json({ ok: true });
});

app.delete('/cache', (req, res) => {
  const { key } = req.query;
  if (!key) return res.status(400).json({ error: 'key is required' });
  const ok = cacheDel(String(key));
  res.json({ ok });
});

// Error handling middleware (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Export app for testing
export default app;

// Initialize database (if configured)
let dbInitialized = false;
if (process.env.DB_PASSWORD) {
  dbInitialized = await initDatabase();
}

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  const useHttps = process.env.USE_HTTPS === 'true';

  if (useHttps) {
    const key = fs.readFileSync(process.env.SSL_KEY_PATH || 'key.pem');
    const cert = fs.readFileSync(process.env.SSL_CERT_PATH || 'cert.pem');
    https.createServer({ key, cert }, app).listen(port, () => {
      console.log(`Servidor HTTPS iniciado en https://localhost:${port}`);
      if (dbInitialized) {
        console.log('Base de datos inicializada correctamente');
      }
    });
  } else {
    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
      if (dbInitialized) {
        console.log('Base de datos inicializada correctamente');
      }
    });
  }

  // Schedule automated backups (every 24 hours by default)
  const backupInterval = parseInt(process.env.BACKUP_INTERVAL_HOURS) || 24;
  scheduleBackups(backupInterval);
}
