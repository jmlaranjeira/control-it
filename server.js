import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { submitHoursRange, getRegisteredDays } from './logic.js';

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

      if ((day >= 1 && day <= 5)) {
        calendarData.push({
          date: iso,
          status: find?.isHoliday ? 'holiday' : (find ? 'registered' : 'pending'),
          isHoliday: find?.isHoliday,
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
        calendarData.push({
          date: iso,
          status: find?.isHoliday ? 'holiday' : (find ? 'registered' : 'pending'),
          isHoliday: find?.isHoliday,
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

app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});