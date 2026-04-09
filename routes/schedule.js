import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getScheduleConfig, updateScheduleConfig, resetScheduleConfig } from '../utils/scheduleConfig.js';

function validateInt(val, min, max) {
  const n = parseInt(val, 10);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export default function createScheduleRouter() {
  const router = Router();

  router.get('/api/schedule-config', requireAuth, (req, res) => {
    res.json({ success: true, config: getScheduleConfig() });
  });

  router.put('/api/schedule-config', requireAuth, (req, res) => {
    const b = req.body;

    const fields = {
      'workSchedule.winter.start.hour':    [b?.workSchedule?.winter?.start?.hour,    0, 23],
      'workSchedule.winter.start.minute':  [b?.workSchedule?.winter?.start?.minute,  0, 59],
      'workSchedule.winter.length.hours':  [b?.workSchedule?.winter?.length?.hours,  0, 23],
      'workSchedule.winter.length.minutes':[b?.workSchedule?.winter?.length?.minutes, 0, 59],
      'workSchedule.lunch.start.hour':     [b?.workSchedule?.lunch?.start?.hour,     0, 23],
      'workSchedule.lunch.start.minute':   [b?.workSchedule?.lunch?.start?.minute,   0, 59],
      'workSchedule.lunch.length.hours':   [b?.workSchedule?.lunch?.length?.hours,   0, 23],
      'workSchedule.lunch.length.minutes': [b?.workSchedule?.lunch?.length?.minutes,  0, 59],
      'workSchedule.summer.start.hour':    [b?.workSchedule?.summer?.start?.hour,    0, 23],
      'workSchedule.summer.start.minute':  [b?.workSchedule?.summer?.start?.minute,  0, 59],
      'workSchedule.summer.length.hours':  [b?.workSchedule?.summer?.length?.hours,  0, 23],
      'workSchedule.summer.length.minutes':[b?.workSchedule?.summer?.length?.minutes, 0, 59],
      'summerStartDay':   [b?.summerStartDay,   1, 31],
      'summerStartMonth': [b?.summerStartMonth, 1, 12],
      'summerEndDay':     [b?.summerEndDay,     1, 31],
      'summerEndMonth':   [b?.summerEndMonth,   1, 12],
    };

    for (const [key, [val, min, max]] of Object.entries(fields)) {
      if (validateInt(val, min, max) === null) {
        return res.status(400).json({ success: false, error: `Campo inválido: ${key} (debe ser entero entre ${min} y ${max})` });
      }
    }

    const newConfig = {
      workSchedule: {
        winter: {
          start:  { hour: parseInt(b.workSchedule.winter.start.hour), minute: parseInt(b.workSchedule.winter.start.minute) },
          length: { hours: parseInt(b.workSchedule.winter.length.hours), minutes: parseInt(b.workSchedule.winter.length.minutes) },
        },
        lunch: {
          start:  { hour: parseInt(b.workSchedule.lunch.start.hour), minute: parseInt(b.workSchedule.lunch.start.minute) },
          length: { hours: parseInt(b.workSchedule.lunch.length.hours), minutes: parseInt(b.workSchedule.lunch.length.minutes) },
        },
        summer: {
          start:  { hour: parseInt(b.workSchedule.summer.start.hour), minute: parseInt(b.workSchedule.summer.start.minute) },
          length: { hours: parseInt(b.workSchedule.summer.length.hours), minutes: parseInt(b.workSchedule.summer.length.minutes) },
        },
      },
      summerStartDay:   parseInt(b.summerStartDay),
      summerStartMonth: parseInt(b.summerStartMonth),
      summerEndDay:     parseInt(b.summerEndDay),
      summerEndMonth:   parseInt(b.summerEndMonth),
    };

    const saved = updateScheduleConfig(newConfig);
    res.json({ success: true, config: saved });
  });

  router.delete('/api/schedule-config', requireAuth, (req, res) => {
    const defaults = resetScheduleConfig();
    res.json({ success: true, config: defaults });
  });

  return router;
}
