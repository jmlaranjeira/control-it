import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import fs from 'fs';
import https from 'https';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';
import { logRequest } from './utils/logger.js';
import { apiLimiter, submitLimiter } from './middleware/rateLimiter.js';
import { metricsMiddleware } from './utils/metrics.js';
import { scheduleBackups } from './utils/backup.js';
import healthRouter from './routes/health.js';
import cacheRouter from './routes/cache.js';
import createCalendarRouter from './routes/calendar.js';
import createAuthRouter from './routes/auth.js';
import createScheduleRouter from './routes/schedule.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'controlJIJI-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.USE_HTTPS === 'true',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
}));

// Favicon handler — serves a 1x1 transparent PNG to avoid 404s
app.get('/favicon.ico', (req, res) => {
  const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=', 'base64');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.send(buf);
});

// Middleware
app.use(metricsMiddleware);
app.use(logRequest);
app.use('/submit', submitLimiter);
app.use(apiLimiter);

// Public routes (no auth required)
app.use(createAuthRouter());
app.use(healthRouter);
app.use(cacheRouter);

// Protected routes
app.use(requireAuth);
app.use(createCalendarRouter());
app.use(createScheduleRouter());

// Error handling (must be after routes)
app.use(notFound);
app.use(errorHandler);

// Schedule automated backups in production
if (process.env.NODE_ENV === 'production') {
  const backupInterval = parseInt(process.env.BACKUP_INTERVAL_HOURS) || 24;
  scheduleBackups(backupInterval);
}

// Start server
if (process.env.NODE_ENV !== 'test') {
  const port = process.env.PORT || 3000;
  const useHttps = process.env.USE_HTTPS === 'true';

  if (useHttps) {
    const key = fs.readFileSync(process.env.SSL_KEY_PATH || 'key.pem');
    const cert = fs.readFileSync(process.env.SSL_CERT_PATH || 'cert.pem');
    https.createServer({ key, cert }, app).listen(port, () => {
      console.info(`Servidor HTTPS iniciado en https://localhost:${port}`);
    });
  } else {
    app.listen(port, () => {
      console.info(`Servidor iniciado en http://localhost:${port}`);
    });
  }
}

export default app;
