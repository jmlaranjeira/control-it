export default {
  // Authentication
  username: process.env.CONTROLIT_USERNAME || "",
  password: process.env.CONTROLIT_PASSWORD || "",

  // API Configuration
  apiBaseUrl: process.env.CONTROLIT_API_BASE_URL || 'https://api.controlit.es/api',
  reportsBaseUrl: process.env.CONTROLIT_REPORTS_BASE_URL || 'https://controlit.es/reports',

  // Event Type IDs
  comidaEventTypeId: process.env.COMIDA_EVENT_TYPE_ID || 'e8e54e66-a996-48f2-8885-b0dbcacb86eb',
  jornadaEventTypeId: process.env.JORNADA_EVENT_TYPE_ID || 'd8cc9d74-ef29-4267-906b-24fda81e87ec',

  // Work Schedule Configuration
  workSchedule: {
    winter: {
      start: {
        hour: parseInt(process.env.WINTER_START_HOUR) || 8,
        minute: parseInt(process.env.WINTER_START_MINUTE) || 0
      },
      length: {
        hours: parseInt(process.env.WINTER_LENGTH_HOURS) || 8,
        minutes: parseInt(process.env.WINTER_LENGTH_MINUTES) || 30
      }
    },
    lunch: {
      start: {
        hour: parseInt(process.env.LUNCH_START_HOUR) || 14,
        minute: parseInt(process.env.LUNCH_START_MINUTE) || 30
      },
      length: {
        hours: parseInt(process.env.LUNCH_LENGTH_HOURS) || 0,
        minutes: parseInt(process.env.LUNCH_LENGTH_MINUTES) || 30
      }
    },
    summer: {
      start: {
        hour: parseInt(process.env.SUMMER_START_HOUR) || 8,
        minute: parseInt(process.env.SUMMER_START_MINUTE) || 0
      },
      length: {
        hours: parseInt(process.env.SUMMER_LENGTH_HOURS) || 7,
        minutes: parseInt(process.env.SUMMER_LENGTH_MINUTES) || 0
      }
    }
  },

  // Summer Schedule Dates
  summerStartDay: parseInt(process.env.SUMMER_START_DAY) || 15,
  summerStartMonth: parseInt(process.env.SUMMER_START_MONTH) || 6,
  summerEndDay: parseInt(process.env.SUMMER_END_DAY) || 15,
  summerEndMonth: parseInt(process.env.SUMMER_END_MONTH) || 9,

  // Application Settings
  maxDateRangeYears: parseInt(process.env.MAX_DATE_RANGE_YEARS) || 1,
  jitterMinutes: parseInt(process.env.JITTER_MINUTES) || 10,
};
