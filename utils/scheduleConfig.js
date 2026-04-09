import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'schedule-config.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readOverrides() {
  try {
    ensureDataDir();
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

function writeOverrides(overrides) {
  ensureDataDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(overrides, null, 2), 'utf8');
}

export function getScheduleConfig() {
  const o = readOverrides();
  return {
    workSchedule: {
      winter: {
        start: {
          hour:    o?.workSchedule?.winter?.start?.hour    ?? config.workSchedule.winter.start.hour,
          minute:  o?.workSchedule?.winter?.start?.minute  ?? config.workSchedule.winter.start.minute,
        },
        length: {
          hours:   o?.workSchedule?.winter?.length?.hours   ?? config.workSchedule.winter.length.hours,
          minutes: o?.workSchedule?.winter?.length?.minutes ?? config.workSchedule.winter.length.minutes,
        },
      },
      lunch: {
        start: {
          hour:    o?.workSchedule?.lunch?.start?.hour    ?? config.workSchedule.lunch.start.hour,
          minute:  o?.workSchedule?.lunch?.start?.minute  ?? config.workSchedule.lunch.start.minute,
        },
        length: {
          hours:   o?.workSchedule?.lunch?.length?.hours   ?? config.workSchedule.lunch.length.hours,
          minutes: o?.workSchedule?.lunch?.length?.minutes ?? config.workSchedule.lunch.length.minutes,
        },
      },
      summer: {
        start: {
          hour:    o?.workSchedule?.summer?.start?.hour    ?? config.workSchedule.summer.start.hour,
          minute:  o?.workSchedule?.summer?.start?.minute  ?? config.workSchedule.summer.start.minute,
        },
        length: {
          hours:   o?.workSchedule?.summer?.length?.hours   ?? config.workSchedule.summer.length.hours,
          minutes: o?.workSchedule?.summer?.length?.minutes ?? config.workSchedule.summer.length.minutes,
        },
      },
    },
    summerStartDay:   o?.summerStartDay   ?? config.summerStartDay,
    summerStartMonth: o?.summerStartMonth ?? config.summerStartMonth,
    summerEndDay:     o?.summerEndDay     ?? config.summerEndDay,
    summerEndMonth:   o?.summerEndMonth   ?? config.summerEndMonth,
  };
}

export function updateScheduleConfig(newConfig) {
  writeOverrides(newConfig);
  return getScheduleConfig();
}

export function resetScheduleConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE);
    }
  } catch {}
  return getScheduleConfig();
}
