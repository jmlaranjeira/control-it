import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import config from './config.js';
import FormData from 'form-data';
import * as cheerio from 'cheerio';
import { get, set, cacheKeys } from './utils/cache.js';
import { logInfo, logWarn } from './utils/logger.js';

const currentYear = DateTime.now().year;
const summerStart = DateTime.fromObject({
  day: config.summerStartDay,
  month: config.summerStartMonth,
  year: currentYear
});
const summerEnd = DateTime.fromObject({
  day: config.summerEndDay,
  month: config.summerEndMonth,
  year: currentYear
});

function formatDate(date) {
  return date.toFormat("yyyy-MM-dd'T'HH':'mm':'ssZZ");
}

async function login(username, password) {
  const response = await fetch(`${config.apiBaseUrl}/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Username: username, Password: password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const data = await response.json();
  return data.User.AccessToken;
}

function buildHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

async function postManualRegister(token, startDate, endDate, eventTypeId) {
  const response = await fetch(`${config.apiBaseUrl}/events/manual-register`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify({
      EventTypeId: eventTypeId,
      StartDate: startDate,
      EndDate: endDate,
    }),
  });

  return response;
}

export async function submitHoursRange({ startDate, endDate, dryRun = true }) {
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const days = [];
  let cursor = start;

  const timeOffMap = await getTimeOffDaysDetailed();

  while (cursor <= end) {
    const isoDate = cursor.toISODate();
    const isTimeOff = Boolean(timeOffMap[isoDate]);

    if (cursor.weekday >= 1 && cursor.weekday <= 5 && !isTimeOff) {
      console.log('Día laborable válido:', isoDate, 'weekday:', cursor.weekday);
      days.push(cursor);
    } else {
      console.log('Saltando día (finde o festivo):', isoDate, 'weekday:', cursor.weekday);
    }

    cursor = cursor.plus({ days: 1 });
  }

  let accessToken = null;
  if (!dryRun) {
    accessToken = await login(config.username, config.password);
  }

  const results = [];

  for (const day of days) {
    const isFriday = day.weekday === 5;
    const isSummer = day >= summerStart && day <= summerEnd;
    const isShortDay = isSummer || isFriday;

    let workStartRaw, workEnd, lunchStart, lunchEnd;

    if (isShortDay) {
      const t = config.workSchedule.summer.start;
      workStartRaw = day.set({ hour: t.hour, minute: t.minute + randomJitter() });
      workEnd = workStartRaw.plus(config.workSchedule.summer.length);
    } else {
      const t = config.workSchedule.winter.start;
      const lunch = config.workSchedule.lunch.start;
      workStartRaw = day.set({ hour: t.hour, minute: t.minute + randomJitter() });
      workEnd = workStartRaw.plus(config.workSchedule.winter.length).plus(config.workSchedule.lunch.length);
      lunchStart = day.set({ hour: lunch.hour, minute: lunch.minute + randomJitter() });
      lunchEnd = lunchStart.plus(config.workSchedule.lunch.length);
    }

    const workStart = formatDate(workStartRaw);
    const workEndStr = formatDate(workEnd);
    const lunchStartStr = lunchStart ? formatDate(lunchStart) : null;
    const lunchEndStr = lunchEnd ? formatDate(lunchEnd) : null;

    if (!dryRun) {
      await postManualRegister(accessToken, workStart, workEndStr, config.jornadaEventTypeId);
      if (lunchStartStr && lunchEndStr) {
        await postManualRegister(accessToken, lunchStartStr, lunchEndStr, config.comidaEventTypeId);
      }
    }

    results.push({
      date: day.toISODate(),
      status: dryRun ? 'dry-run' : 'submitted',
      dryRun: dryRun,
      isHoliday: (timeOffMap[day.toISODate()] === 'holiday')
    });
  }

  return results || [];
}

function randomJitter() {
  return Math.round(Math.random() * config.jitterMinutes);
}

export async function getRegisteredDays(startDate, endDate) {
  const [timeOffMap, registeredFromReport] = await Promise.all([
    getTimeOffDaysDetailed(),
    getRegisteredDaysFromReport(startDate, endDate)
  ]);
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const calendarData = [];
  let cursor = start;

  while (cursor <= end) {
    const isoDate = cursor.toISODate();
    const timeOffType = timeOffMap[isoDate];
    const isHoliday = timeOffType === 'holiday';
    const isVacation = timeOffType === 'vacation';
    const isLeave = timeOffType === 'leave';
    const isRegistered = registeredFromReport.includes(isoDate);
    calendarData.push({
      date: isoDate,
      status: isHoliday ? 'holiday' : (isVacation ? 'vacation' : (isLeave ? 'leave' : (isRegistered ? 'registered' : 'pending'))),
      isHoliday: isHoliday
    });

    cursor = cursor.plus({ days: 1 });
  }
  return calendarData;
}

export async function getDetailedEventsByRange(startDate, endDate) {
  const registeredDays = await getRegisteredDaysFromReport(startDate, endDate);
  const results = [];

  const token = await login(config.username, config.password);

  for (const date of registeredDays) {
    const formattedDate = DateTime.fromISO(date).toFormat('dd-MM-yyyy');
    const response = await fetch(`${config.apiBaseUrl}/events/get-events-from-day?day=${formattedDate}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn(`Fallo al obtener eventos de ${date}`);
      continue;
    }

    const events = await response.json();
    results.push({ date, events });
  }

  return results;
}

export async function getTimeOffDaysDetailed() {
  const cacheKey = cacheKeys.vacationDaysDetailed ? cacheKeys.vacationDaysDetailed() : 'vacation_days_detailed';

  // Try to get from cache first
  const cachedData = get(cacheKey);
  if (cachedData) {
    logInfo('Serving detailed time-off days from cache');
    return cachedData;
  }

  logInfo('Fetching vacation days from API');
  const token = await login(config.username, config.password);
  const response = await fetch(`${config.apiBaseUrl}/vacations/get-vacations-and-onduty-ranges-from-employee`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    logWarn('Failed to fetch vacation days from API', { status: response.status });
    return {};
  }

  const data = await response.json();

  // Support multiple possible shapes for the vacations list
  const list =
    data?.VacationsAnOnDutyCalendarDays || // original (typo?)
    data?.VacationsAndOnDutyCalendarDays || // corrected spelling
    data?.vacations ||
    data?.Days ||
    [];

  if (!Array.isArray(list)) {
    logWarn('Invalid vacation days response format');
    return {};
  }

  const map = {};
  for (const day of list) {
    const raw = day?.Day || day?.Date || day?.date || '';
    const iso = String(raw).split('T')[0] && /\d{4}-\d{2}-\d{2}/.test(String(raw).split('T')[0])
      ? String(raw).split('T')[0]
      : DateTime.fromISO(String(raw)).toISODate();
    if (!iso) continue;

    if (day?.IsHoliday === true) {
      map[iso] = 'holiday';
    } else if (day?.IsLeaveDay === true) {
      map[iso] = 'leave';
    } else if (day?.IsWorkedDay === true) {
      map[iso] = 'vacation';
    }
  }

  set(cacheKey, map, 3600);
  logInfo('Cached detailed time-off days', { count: Object.keys(map).length });
  return map;
}

export async function getVacationDays() {
  // Backward compatibility: return array of all time-off days
  const detailed = await getTimeOffDaysDetailed();
  return Object.keys(detailed);
}

export async function getRegisteredDaysFromReport(startDate, endDate) {
  const cacheKey = cacheKeys.registeredDays(startDate, endDate);

  // Try to get from cache first
  const cachedData = get(cacheKey);
  if (cachedData) {
    logInfo('Serving registered days from cache', { startDate, endDate });
    return cachedData;
  }

  logInfo('Fetching registered days from API', { startDate, endDate });
  const token = await login(config.username, config.password);
  const formData = new FormData();
  formData.append('startDate', DateTime.fromISO(startDate).toFormat('dd-MM-yyyy'));
  formData.append('endDate', DateTime.fromISO(endDate).toFormat('dd-MM-yyyy'));
  const response = await fetch(`${config.reportsBaseUrl}/get-detailed-report`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });

  if (!response.ok) {
    logWarn('Failed to fetch registered days report', { status: response.status, startDate, endDate });
    return [];
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const registeredDates = [];

  $('table tbody tr').each((_, element) => {
    const dateText = $(element).find('td').first().text().trim();

    if (dateText) {
      const [day, month, year] = dateText.split('/');
      const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      registeredDates.push(isoDate);
    }
  });

  // Cache for 30 minutes (1800 seconds) since registered days can change
  set(cacheKey, registeredDates, 1800);
  logInfo('Cached registered days', { startDate, endDate, count: registeredDates.length });

  return registeredDates;
}
