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
import { performDependencyHealthCheck } from './utils/dependencyManager.js';

// Placeholder for holiday checking logic
async function checkIfHoliday(date) {
  // Implement holiday logic here. For now, return false.
  return false;
}

const app = express();
const port = 3000;

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
    res.status(500).json({
      status: 'dependency_health_error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Request logging middleware
app.use(logRequest);

// Rate limiting middleware
app.use('/submit', submitLimiter);
app.use(apiLimiter);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

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

  const results = await submitHoursRange({
    startDate: startISO,
    endDate: endISO,
    dryRun: dryRun === 'on',
  });

  const today = new Date();
  const yearStart = new Date(today.getFullYear(), 0, 1);
  const calendarStartISO = yearStart.toISOString().slice(0, 10);
  const calendarEndISO = today.toISOString().slice(0, 10);
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

// Export app for testing
export default app;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  const useHttps = process.env.USE_HTTPS === 'true';

  if (useHttps) {
    const key = fs.readFileSync(process.env.SSL_KEY_PATH || 'key.pem');
    const cert = fs.readFileSync(process.env.SSL_CERT_PATH || 'cert.pem');
    https.createServer({ key, cert }, app).listen(port, () => {
      console.log(`Servidor HTTPS iniciado en https://localhost:${port}`);
    });
  } else {
    app.listen(port, () => {
      console.log(`Servidor iniciado en http://localhost:${port}`);
    });
  }
}