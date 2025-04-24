import { DateTime } from 'luxon';
import fetch from 'node-fetch';
import config from './config.js';
import FormData from 'form-data';
import cheerio from 'cheerio';

const comidaEventTypeId = 'e8e54e66-a996-48f2-8885-b0dbcacb86eb';
const jornadaEventTypeId = 'd8cc9d74-ef29-4267-906b-24fda81e87ec';

const currentYear = DateTime.now().year;
const summerStart = DateTime.fromObject({ day: 15, month: 6, year: currentYear });
const summerEnd = DateTime.fromObject({ day: 15, month: 9, year: currentYear });

const workSchedule = {
  winter: { start: { hour: 8, minute: 0 }, length: { hours: 8, minutes: 30 } },
  lunch: { start: { hour: 14, minute: 30 }, length: { hours: 0, minutes: 30 } },
  summer: { start: { hour: 8, minute: 0 }, length: { hours: 7, minutes: 0 } },
};

function formatDate(date) {
  return date.toFormat("yyyy-MM-dd'T'HH':'mm':'ssZZ");
}

async function login(username, password) {
  const response = await fetch('https://api.controlit.es/api/authenticate', {
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
  const response = await fetch('https://api.controlit.es/api/events/manual-register', {
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

  const vacationDays = await getVacationDays();

  while (cursor <= end) {
    const isoDate = cursor.toISODate();
    const isHoliday = vacationDays.includes(isoDate);

    if (cursor.weekday >= 1 && cursor.weekday <= 5 && !isHoliday) {
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
      const t = workSchedule.summer.start;
      workStartRaw = day.set({ hour: t.hour, minute: t.minute + randomJitter() });
      workEnd = workStartRaw.plus(workSchedule.summer.length);
    } else {
      const t = workSchedule.winter.start;
      const lunch = workSchedule.lunch.start;
      workStartRaw = day.set({ hour: t.hour, minute: t.minute + randomJitter() });
      workEnd = workStartRaw.plus(workSchedule.winter.length).plus(workSchedule.lunch.length);
      lunchStart = day.set({ hour: lunch.hour, minute: lunch.minute + randomJitter() });
      lunchEnd = lunchStart.plus(workSchedule.lunch.length);
    }

    const workStart = formatDate(workStartRaw);
    const workEndStr = formatDate(workEnd);
    const lunchStartStr = lunchStart ? formatDate(lunchStart) : null;
    const lunchEndStr = lunchEnd ? formatDate(lunchEnd) : null;

    if (!dryRun) {
      await postManualRegister(accessToken, workStart, workEndStr, jornadaEventTypeId);
      if (lunchStartStr && lunchEndStr) {
        await postManualRegister(accessToken, lunchStartStr, lunchEndStr, comidaEventTypeId);
      }
    }

    results.push({
      date: day.toISODate(),
      status: dryRun ? 'dry-run' : 'submitted',
      dryRun: dryRun,
      isHoliday: vacationDays.includes(day.toISODate())
    });
  }

  return results || [];
}

function randomJitter() {
  return Math.round(Math.random() * 10);
}

export async function getRegisteredDays(startDate, endDate) {
  const [vacationDays, registeredFromReport] = await Promise.all([
    getVacationDays(),
    getRegisteredDaysFromReport(startDate, endDate)
  ]);
  const start = DateTime.fromISO(startDate);
  const end = DateTime.fromISO(endDate);
  const calendarData = [];
  let cursor = start;

  while (cursor <= end) {
    const isoDate = cursor.toISODate();
    const isHoliday = vacationDays.includes(isoDate);
    const isRegistered = registeredFromReport.includes(isoDate);
    calendarData.push({
      date: isoDate,
      status: isHoliday ? 'holiday' : (isRegistered ? 'registered' : 'pending'),
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
    const response = await fetch(`https://api.controlit.es/api/events/get-events-from-day?day=${formattedDate}`, {
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

export async function getVacationDays() {
  const token = await login(config.username, config.password);
  const response = await fetch('https://api.controlit.es/api/vacations/get-vacations-and-onduty-ranges-from-employee', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    console.warn('No se pudo obtener el calendario de vacaciones');
    return [];
  }

  const data = await response.json();

  if (!Array.isArray(data.VacationsAnOnDutyCalendarDays)) {
    return [];
  }

  return data.VacationsAnOnDutyCalendarDays
    .filter(day => day.IsHoliday || day.IsLeaveDay)
    .map(day => DateTime.fromISO(day.Day).toISODate());
}

export async function getRegisteredDaysFromReport(startDate, endDate) {
  const token = await login(config.username, config.password);
  const formData = new FormData();
  formData.append('startDate', DateTime.fromISO(startDate).toFormat('dd-MM-yyyy'));
  formData.append('endDate', DateTime.fromISO(endDate).toFormat('dd-MM-yyyy'));
  const response = await fetch('https://controlit.es/reports/get-detailed-report', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });
  
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

  return registeredDates;
}