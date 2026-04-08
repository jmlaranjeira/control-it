import { Router } from 'express';
import { submitHoursRange, getRegisteredDays } from '../logic.js';
import { catchAsync, validateDateRange } from '../middleware/errorHandler.js';
import { get as cacheGet, set as cacheSet, del as cacheDel, cacheKeys } from '../utils/cache.js';

// Returns a local YYYY-MM-DD string without UTC conversion
function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildCalendarData(registered, startDate, today) {
  const calendarData = [];
  const todayStr = localDateStr(today);
  let cursor = new Date(startDate);
  cursor.setHours(12, 0, 0, 0); // noon to avoid UTC midnight timezone drift
  while (localDateStr(cursor) <= todayStr) {
    const iso = localDateStr(cursor);
    const day = cursor.getDay(); // 0=Sun, 6=Sat
    const isWeekend = day === 0 || day === 6;
    const find = registered.find(r => r.date === iso);
    const isHoliday = !isWeekend && !!find?.isHoliday;
    calendarData.push({
      date: iso,
      status: isWeekend ? 'weekend' : (isHoliday ? 'holiday' : (find?.status || 'pending')),
      isHoliday,
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return calendarData;
}

function computeStats(calendarData) {
  return {
    registered: calendarData.filter(d => d.status === 'registered').length,
    pending: calendarData.filter(d => d.status === 'pending').length,
    holiday: calendarData.filter(d => d.status === 'holiday').length,
    vacation: calendarData.filter(d => d.status === 'vacation').length,
  };
}

export default function createCalendarRouter() {
  const router = Router();

  router.get('/', catchAsync(async (req, res) => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1);
    const startISO = startDate.toISOString().slice(0, 10);
    const endISO = today.toISOString().slice(0, 10);

    const registered = await getRegisteredDays(startISO, endISO);
    const calendarData = buildCalendarData(registered, startDate, today);
    const stats = computeStats(calendarData);
    const firstPending = calendarData.find(d => d.status === 'pending')?.date ?? '';

    const { submitted, start: qsStart, end: qsEnd, dry, job } = req.query || {};
    const startPrefill = typeof qsStart === 'string' ? qsStart : '';
    const endPrefill = typeof qsEnd === 'string' ? qsEnd : '';
    const showSubmitted = submitted === '1';
    const dryRun = (typeof dry === 'undefined') ? true : (dry === '1');

    let synthesizedResults = [];
    if (showSubmitted && job) {
      const cached = cacheGet(`job_results_${job}`);
      if (Array.isArray(cached)) synthesizedResults = cached;
    }
    if (showSubmitted && dryRun && startPrefill && endPrefill && synthesizedResults.length === 0) {
      try {
        const rangeEndStr = endPrefill;
        let cursorSim = new Date(startPrefill);
        cursorSim.setHours(12, 0, 0, 0);
        while (localDateStr(cursorSim) <= rangeEndStr) {
          const iso = localDateStr(cursorSim);
          const dow = cursorSim.getDay();
          const find = calendarData.find(d => d.date === iso);
          const status = find?.status;
          const isPending = status === 'pending';
          if (dow >= 1 && dow <= 5 && isPending) {
            synthesizedResults.push({ date: iso, dryRun: true, status: 'dry-run', isHoliday: false });
          }
          cursorSim.setDate(cursorSim.getDate() + 1);
        }
      } catch {}
    }

    res.render('index', {
      results: synthesizedResults,
      calendarData,
      startDate: startPrefill,
      endDate: endPrefill,
      isLoading: false,
      submitted: showSubmitted,
      dryRun,
      stats,
      firstPending,
    });
  }));

  router.post('/submit', validateDateRange, catchAsync(async (req, res) => {
    const { dryRun } = req.body;
    const { startISO, endISO } = req.validatedDates;
    const isDryRunActive = dryRun === 'on';

    const results = await submitHoursRange({ startDate: startISO, endDate: endISO, dryRun: isDryRunActive });

    const today = new Date();
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const calendarStartISO = yearStart.toISOString().slice(0, 10);
    const calendarEndISO = today.toISOString().slice(0, 10);

    try {
      cacheDel(cacheKeys.registeredDays(startISO, endISO));
      cacheDel(cacheKeys.registeredDays(calendarStartISO, calendarEndISO));
    } catch {}

    const jobId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    try { cacheSet(`job_results_${jobId}`, results, 600); } catch {}

    return res.redirect(303, `/?submitted=1&start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}&dry=${dryRun === 'on' ? '1' : '0'}&job=${encodeURIComponent(jobId)}`);
  }));

  router.post('/submit-day', validateDateRange, catchAsync(async (req, res) => {
    const { dryRun } = req.body;
    const { startISO, endISO } = req.validatedDates;
    const isDryRun = dryRun === 'on';

    const results = await submitHoursRange({ startDate: startISO, endDate: endISO, dryRun: isDryRun });

    try {
      const today = new Date();
      const yearStart = new Date(today.getFullYear(), 0, 1);
      cacheDel(cacheKeys.registeredDays(startISO, endISO));
      cacheDel(cacheKeys.registeredDays(yearStart.toISOString().slice(0, 10), today.toISOString().slice(0, 10)));
    } catch {}

    return res.json({ success: true, dryRun: isDryRun, results });
  }));

  return router;
}
