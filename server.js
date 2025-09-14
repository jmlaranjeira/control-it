import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { DateTime } from 'luxon';
import fs from 'fs';
import https from 'https';
import { submitHoursRange, getRegisteredDaysFromReport, getRegisteredDays } from './logic.js';

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

app.get('/', async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).send(`Error al cargar el calendario: ${error.message}`);
  }
});

app.post('/submit', async (req, res) => {
  const { startDate, endDate, dryRun } = req.body;

  // Input validation
  if (!startDate || !endDate) {
    return res.status(400).send('Start date and end date are required');
  }

  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);

  if (!start.isValid || !end.isValid) {
    return res.status(400).send('Invalid date format. Use YYYY-MM-DD format.');
  }

  if (start > end) {
    return res.status(400).send('Start date must be before or equal to end date');
  }

  const today = DateTime.now();
  if (end > today) {
    return res.status(400).send('End date cannot be in the future');
  }

  if (start < today.minus({ years: 1 })) {
    return res.status(400).send('Start date cannot be more than 1 year in the past');
  }

  try {
    const results = await submitHoursRange({
      startDate,
      endDate,
      dryRun: dryRun === 'on',
    });

    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const startISO = yearStart.toISOString().slice(0, 10);
    const endISO = today.toISOString().slice(0, 10);
    const registered = await getRegisteredDays(startISO, endISO);

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
    
    res.render('index', { calendarData, results, startDate, endDate, isLoading: false });
  } catch (error) {
    res.status(500).send(`Error al procesar: ${error.message}`);
  }
});

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