/**
 * api-explorer.js
 *
 * Abre el frontend oficial de ControlIT en Chromium, intercepta todas las
 * llamadas API mientras navegas, y al cerrar el navegador genera:
 *   - docs/api-captured.json  (datos crudos)
 *   - docs/api-reference.md   (documentación legible)
 *
 * Uso:
 *   node scripts/api-explorer.js
 *   npm run explore
 */

import 'dotenv/config';
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname  = path.dirname(fileURLToPath(import.meta.url));
const DOCS_DIR   = path.join(__dirname, '..', 'docs');
const JSON_OUT   = path.join(DOCS_DIR, 'api-captured.json');
const MD_OUT     = path.join(DOCS_DIR, 'api-reference.md');
const BASE_URL   = 'https://controlit.es';
const API_HOSTS  = ['api.controlit.es', 'controlit.es'];

// ─── Captura ────────────────────────────────────────────────────────────────

const captured   = [];          // entradas finales
const pending    = [];          // promesas de lectura de response body

function isApiCall(request) {
  const type = request.resourceType();
  if (!['fetch', 'xhr'].includes(type)) return false;
  try {
    const { hostname } = new URL(request.url());
    return API_HOSTS.some(h => hostname === h || hostname.endsWith('.' + h));
  } catch { return false; }
}

function normalizeUrl(rawUrl) {
  try {
    const u    = new URL(rawUrl);
    const path = u.pathname
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '{uuid}')
      .replace(/\b\d{4}-\d{2}-\d{2}\b/g, '{date}')
      .replace(/\b\d{2}-\d{2}-\d{4}\b/g, '{date}')
      .replace(/(\/)\d+(\/|$)/g, '$1{id}$2');
    return `${u.protocol}//${u.host}${path}`;
  } catch { return rawUrl; }
}

function captureResponse(response) {
  const request = response.request();
  if (!isApiCall(request)) return;

  const p = (async () => {
    const url    = request.url();
    const method = request.method();
    const status = response.status();

    let requestBody = null;
    try {
      const raw = request.postData();
      if (raw) requestBody = tryParseJson(raw) ?? raw;
    } catch {}

    let responseBody = null;
    try {
      const ct = response.headers()['content-type'] ?? '';
      if (ct.includes('application/json')) {
        responseBody = await response.json().catch(() => null);
      } else if (ct.includes('text/html')) {
        const html = await response.text().catch(() => '');
        responseBody = `[HTML · ${html.length} chars]`;
      }
    } catch {}

    const entry = {
      method,
      url,
      normalizedUrl : normalizeUrl(url),
      status,
      requestBody,
      responseBody,
      timestamp     : new Date().toISOString(),
    };

    captured.push(entry);
    console.log(`  ↳ [${method}] ${status}  ${url}`);
  })();

  pending.push(p);
}

function tryParseJson(str) {
  try { return JSON.parse(str); } catch { return null; }
}

// ─── Generación de docs ──────────────────────────────────────────────────────

function generateMarkdown(entries) {
  // Agrupar por método + URL normalizada
  const groups = new Map();
  for (const e of entries) {
    const key = `${e.method} ${e.normalizedUrl}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(e);
  }

  const sorted = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  const now = new Date().toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
  let md = `# ControlIT API Reference\n\n`;
  md += `> Auto-generado por \`scripts/api-explorer.js\` — ${now}\n\n`;
  md += `**Endpoints únicos descubiertos:** ${sorted.length}  \n`;
  md += `**Llamadas totales capturadas:** ${entries.length}\n\n`;
  md += `---\n\n`;
  md += `## Índice\n\n`;
  sorted.forEach(([key], i) => {
    md += `${i + 1}. [\`${key}\`](#${slugify(key)})\n`;
  });
  md += `\n---\n\n`;

  for (const [key, calls] of sorted) {
    const sample   = calls[0];
    const statuses = [...new Set(calls.map(c => c.status))].join(', ');

    md += `## \`${key}\` {#${slugify(key)}}\n\n`;
    md += `| Campo | Valor |\n|---|---|\n`;
    md += `| **URL** | \`${sample.normalizedUrl}\` |\n`;
    md += `| **Método** | \`${sample.method}\` |\n`;
    md += `| **Status** | ${statuses} |\n`;
    md += `| **Observado** | ${calls.length}× |\n\n`;

    // Query params del primer ejemplo real
    try {
      const qs = new URL(sample.url).search;
      if (qs) {
        md += `### Query params\n\n\`\`\`\n${decodeURIComponent(qs)}\n\`\`\`\n\n`;
      }
    } catch {}

    if (sample.requestBody != null) {
      const body = typeof sample.requestBody === 'object'
        ? JSON.stringify(sample.requestBody, null, 2)
        : String(sample.requestBody);
      md += `### Request body\n\n\`\`\`json\n${body.slice(0, 3000)}\n\`\`\`\n\n`;
    }

    if (sample.responseBody != null) {
      const body = typeof sample.responseBody === 'object'
        ? JSON.stringify(sample.responseBody, null, 2)
        : String(sample.responseBody);
      md += `### Response body (ejemplo)\n\n\`\`\`json\n${body.slice(0, 4000)}\n\`\`\`\n\n`;
    }

    // Si hay varias llamadas con cuerpos distintos, mostrar variantes
    const extras = calls.slice(1).filter(c =>
      JSON.stringify(c.requestBody) !== JSON.stringify(sample.requestBody)
    );
    if (extras.length > 0) {
      md += `<details><summary>Otras variantes de request body (${extras.length})</summary>\n\n`;
      for (const e of extras.slice(0, 5)) {
        md += `\`\`\`json\n${JSON.stringify(e.requestBody, null, 2).slice(0, 1000)}\n\`\`\`\n\n`;
      }
      md += `</details>\n\n`;
    }

    md += `---\n\n`;
  }

  return md;
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── Guardar resultados ──────────────────────────────────────────────────────

async function saveResults() {
  // Esperar todas las lecturas de body pendientes
  await Promise.allSettled(pending);

  if (captured.length === 0) {
    console.log('\nNo se capturaron llamadas API.');
    return;
  }

  if (!existsSync(DOCS_DIR)) mkdirSync(DOCS_DIR, { recursive: true });

  // Merge con capturas anteriores si ya existe el JSON
  let all = captured;
  if (existsSync(JSON_OUT)) {
    try {
      const prev = JSON.parse(readFileSync(JSON_OUT, 'utf8'));
      all = [...prev, ...captured];
    } catch {}
  }

  writeFileSync(JSON_OUT, JSON.stringify(all, null, 2));
  writeFileSync(MD_OUT,   generateMarkdown(all));

  console.log(`\n──────────────────────────────────────────`);
  console.log(`  ${captured.length} llamadas capturadas esta sesión`);
  console.log(`  ${all.length} llamadas en total (incluyendo sesiones previas)`);
  console.log(`  JSON  → ${JSON_OUT}`);
  console.log(`  Docs  → ${MD_OUT}`);
  console.log(`──────────────────────────────────────────\n`);
}

// ─── Auto-login ──────────────────────────────────────────────────────────────

async function tryLogin(page, username, password) {
  try {
    // Esperar campo de usuario
    await page.waitForSelector('input[type="text"], input[type="email"]', { timeout: 6000 });

    const userField = page.locator('input[type="text"], input[type="email"]').first();
    const passField = page.locator('input[type="password"]').first();

    await userField.fill(username);
    await passField.fill(password);
    await passField.press('Enter');

    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
    console.log('  Login enviado automáticamente.');
  } catch {
    console.log('  Login automático no completado — hazlo manualmente en el navegador.');
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const username = process.env.CONTROLIT_USERNAME;
  const password = process.env.CONTROLIT_PASSWORD;

  if (!username || !password) {
    console.error('ERROR: Faltan CONTROLIT_USERNAME / CONTROLIT_PASSWORD en .env');
    process.exit(1);
  }

  console.log('');
  console.log('══════════════════════════════════════════');
  console.log('  ControlIT API Explorer');
  console.log('══════════════════════════════════════════');
  console.log(`  Usuario : ${username}`);
  console.log(`  URL     : ${BASE_URL}`);
  console.log('');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page    = await context.newPage();

  // Interceptar todas las respuestas
  page.on('response', captureResponse);

  // Guardar al cerrar el navegador
  browser.on('disconnected', async () => {
    await saveResults();
    process.exit(0);
  });

  // Guardar también con Ctrl+C
  process.on('SIGINT', async () => {
    console.log('\nInterrumpido — guardando resultados...');
    await saveResults();
    await browser.close().catch(() => {});
    process.exit(0);
  });

  console.log('  Abriendo navegador...');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  console.log('  Intentando login automático...');
  await tryLogin(page, username, password);

  console.log('');
  console.log('──────────────────────────────────────────');
  console.log('  NAVEGA la app con libertad.');
  console.log('  Cada llamada API queda registrada.');
  console.log('  Cierra el navegador cuando termines.');
  console.log('──────────────────────────────────────────');
  console.log('');

  // Mantener el proceso vivo hasta que el navegador se cierre
  await new Promise(() => {});
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
