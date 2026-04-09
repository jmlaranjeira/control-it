/**
 * Explore ControlIT API to find vacation-related endpoints.
 *
 * Usage:
 *   CONTROLIT_USERNAME=user CONTROLIT_PASSWORD=pass node scripts/explore-api.js
 *
 * Or if you have a session running, it will use env/config defaults.
 */
import config from '../config.js';
import fetch from 'node-fetch';

const BASE = config.apiBaseUrl;

async function login() {
  const res = await fetch(`${BASE}/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Username: config.username || process.env.CONTROLIT_USERNAME,
      Password: config.password || process.env.CONTROLIT_PASSWORD,
    }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const data = await res.json();
  return data.User.AccessToken;
}

async function tryEndpoint(token, path, label) {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const status = res.status;
    if (!res.ok) {
      console.log(`  [${status}] ${label}: ${path}`);
      return null;
    }
    const data = await res.json();
    console.log(`  [${status}] ${label}: ${path}`);
    // Show top-level keys and array lengths
    for (const [k, v] of Object.entries(data)) {
      if (Array.isArray(v)) {
        console.log(`         ${k}: Array(${v.length})`);
        if (v.length > 0) {
          console.log(`         Sample keys: ${Object.keys(v[0]).join(', ')}`);
          // Show first item
          console.log(`         First item: ${JSON.stringify(v[0], null, 2).slice(0, 500)}`);
        }
      } else {
        console.log(`         ${k}: ${typeof v === 'object' ? JSON.stringify(v).slice(0, 200) : v}`);
      }
    }
    return data;
  } catch (e) {
    console.log(`  [ERR]  ${label}: ${path} — ${e.message}`);
    return null;
  }
}

async function main() {
  console.log('Logging in...');
  const token = await login();
  console.log('OK\n');

  console.log('=== 1. Calendar entries (current year) ===');
  const cal = await tryEndpoint(token, `/calendars/get-employee-calendar?year=2026`, 'Employee Calendar');

  // Show all unique Text + Color combinations
  if (cal?.Calendar) {
    const types = new Map();
    for (const e of cal.Calendar) {
      const key = `${e.Text}|${e.Color}`;
      if (!types.has(key)) types.set(key, { text: e.Text, color: e.Color, count: 0, sample: e });
      types.get(key).count++;
    }
    console.log('\n  Unique entry types:');
    for (const [, v] of types) {
      console.log(`    Text="${v.text}" Color=${v.color} (${v.count} days)`);
      console.log(`    Sample: ${JSON.stringify(v.sample, null, 2).slice(0, 300)}`);
    }
  }

  console.log('\n=== 2. Leave days ===');
  await tryEndpoint(token, '/leave-days/list-all', 'Leave Days');

  console.log('\n=== 3. Trying vacation-related endpoints ===');
  const candidates = [
    '/vacations/get-vacations-and-onduty-ranges-from-employee',
    '/vacation-days/list-all',
    '/vacation-days/list',
    '/vacation-requests/list-all',
    '/vacation-requests/list',
    '/holidays/list-all',
    '/holidays/list',
    '/holidays/employee-holidays',
    '/absence-requests/list-all',
    '/absences/list-all',
    '/absences/list',
    '/time-off/list-all',
    '/time-off/list',
    '/employee/holidays',
    '/employee/vacations',
    '/employee/absences',
  ];
  for (const path of candidates) {
    await tryEndpoint(token, path, 'Probe');
  }
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
