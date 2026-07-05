// scripts/update-fx.mjs
//
// Könnyű, gyors szkript, ami CSAK az EUR/HUF árfolyamot frissíti a
// data/summaries.json-ban, a kategóriák (hírek) érintése nélkül.
// Ezért futhat sokkal gyakrabban (óránként), mint a nehéz, Playwrightot
// használó hírgyűjtés — nincs benne semmi, ami ezt megdrágítaná vagy lelassítaná.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const OUTPUT_PATH = path.join(ROOT, 'data', 'summaries.json');

function log(...args) {
  console.log(new Date().toISOString(), '—', ...args);
}

async function fetchFx() {
  try {
    const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/EURHUF=X?range=1d&interval=1d', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; NapiSzemleBot/1.0)' },
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const result = data?.chart?.result?.[0];
    if (!result?.meta?.regularMarketPrice) throw new Error('Nincs Yahoo árfolyamadat.');
    return {
      rate: result.meta.regularMarketPrice,
      date: new Date((result.meta.regularMarketTime || Date.now() / 1000) * 1000).toISOString(),
      source: 'Yahoo Finance',
    };
  } catch (yahooErr) {
    log('Yahoo Finance árfolyam sikertelen:', yahooErr.message, '— Frankfurter/ECB tartalék');
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=HUF');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      if (!data?.rates?.HUF) throw new Error('Nincs Frankfurter árfolyamadat.');
      return { rate: data.rates.HUF, date: data.date, source: 'ECB referencia (Frankfurter.app) — tartalék' };
    } catch (fallbackErr) {
      log('Frankfurter árfolyam is sikertelen:', fallbackErr.message);
      return null;
    }
  }
}

async function main() {
  let current;
  try {
    current = JSON.parse(await readFile(OUTPUT_PATH, 'utf-8'));
  } catch {
    current = { generatedAt: new Date().toISOString(), fx: null, categories: {} };
  }

  const fx = await fetchFx();
  if (!fx) {
    log('Nem sikerült árfolyamot szerezni, a meglévő adat marad.');
    return;
  }

  current.fx = fx;
  current.fxUpdatedAt = new Date().toISOString();

  await writeFile(OUTPUT_PATH, JSON.stringify(current, null, 2), 'utf-8');
  log('Árfolyam frissítve:', fx.rate, fx.source);
}

main().catch((err) => {
  console.error('Hiba az árfolyam-frissítés közben:', err);
  process.exit(1);
});
