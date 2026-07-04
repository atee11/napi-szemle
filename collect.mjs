// scripts/collect.mjs
//
// Ezt a szkriptet a GitHub Actions futtatja ütemezve (lásd .github/workflows/update-news.yml).
// Nem fut a felhasználó böngészőjében — ezért nincs CORS-korlát, és az API-kulcsok
// (GEMINI_API_KEY) sosem kerülnek a kliens oldalra.
//
// Lépések:
//   1. Minden forráshoz megpróbál RSS-t olvasni (rss-parser).
//   2. Ha egy forrásnál nincs RSS-elem, Playwrighttal, generikus heurisztikával
//      (a legtöbb linkelt szöveg a főoldalon) kinyeri a legfrissebb híreket.
//   3. Kategóriánként (politika, sport, technológia, gazdaság, környezet) a
//      Google Gemini API-val 5-6 soros összefoglalót generál. Ha ez sikertelen,
//      egyszerű kulcs nélküli kivonatolással pótolja.
//   4. Lekéri az EUR/HUF árfolyamot (Yahoo Finance, tartalék: Frankfurter/ECB).
//   5. Mindezt egy data/summaries.json fájlba írja, amit a statikus frontend olvas ki.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import Parser from 'rss-parser';
import { chromium } from 'playwright';

const ROOT = path.resolve(new URL('.', import.meta.url).pathname, '..');
const SOURCES_PATH = path.join(ROOT, 'sources.json');
const OUTPUT_PATH = path.join(ROOT, 'data', 'summaries.json');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const rssParser = new Parser({ timeout: 15000 });

const HU_STOPWORDS = new Set(('a az egy és hogy is nem de mint vagy ez azt ha meg már csak még ' +
  'mert amely amelyek kell van volt lesz majd így ezt arra erre ki be fel le el át össze szerint ' +
  'miatt között során illetve valamint azonban ugyanakkor mivel míg amikor ahol aki akik ami amik ' +
  'ő ők őt nekik neki mi mit ti ön önök e ennek annak azért ezért tehát pedig vagyis viszont ' +
  'majdnem szinte igen talán persze aztán után előtt alatt fölött felé ellen nélkül ' +
  'számára része kapcsán ügyében ma tegnap holnap most jelenleg korábban').split(/\s+/));

function log(...args) {
  console.log(new Date().toISOString(), '—', ...args);
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadSources() {
  const raw = await readFile(SOURCES_PATH, 'utf-8');
  return JSON.parse(raw);
}

/* ============ Forrás -> cikkek (RSS elsődleges, Playwright a tartalék) ============ */

async function fetchRssArticles(source) {
  const feed = await rssParser.parseURL(source.rss);
  const items = (feed.items || []).slice(0, 6).map((it) => ({
    title: stripHtml(it.title || ''),
    desc: stripHtml(it.contentSnippet || it.content || '').slice(0, 400),
    link: it.link || source.scrapeUrl,
    pubDate: it.isoDate || it.pubDate || null,
    source: source.name,
  })).filter((a) => a.title);
  if (!items.length) throw new Error('Az RSS válasz üres volt.');
  return items;
}

async function scrapeFallbackArticles(source, browser) {
  const page = await browser.newPage({ userAgent: 'Mozilla/5.0 (compatible; NapiSzemleBot/1.0)' });
  try {
    await page.goto(source.scrapeUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    const raw = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a'));
      return anchors
        .map((a) => ({ text: (a.textContent || '').trim(), href: a.getAttribute('href') || '' }))
        .filter((a) => a.text.length >= 25 && a.text.length <= 200 && a.href);
    });
    const seen = new Set();
    const items = [];
    for (const a of raw) {
      if (seen.has(a.text)) continue;
      seen.add(a.text);
      let link;
      try { link = new URL(a.href, source.scrapeUrl).toString(); } catch { continue; }
      items.push({ title: a.text, desc: '', link, pubDate: null, source: source.name });
      if (items.length >= 6) break;
    }
    if (!items.length) throw new Error('Nem található elég hosszú linkszöveg a főoldalon.');
    return items;
  } finally {
    await page.close();
  }
}

async function collectSourceArticles(source, browser) {
  try {
    const items = await fetchRssArticles(source);
    log(`RSS OK — ${source.name}: ${items.length} cikk`);
    return items;
  } catch (rssErr) {
    log(`RSS sikertelen (${source.name}): ${rssErr.message} — Playwright fallback indul`);
    try {
      const items = await scrapeFallbackArticles(source, browser);
      log(`Fallback scrape OK — ${source.name}: ${items.length} cikk`);
      return items;
    } catch (scrapeErr) {
      log(`Fallback scrape is sikertelen (${source.name}): ${scrapeErr.message}`);
      return [];
    }
  }
}

/* ============ Összegzés: Gemini elsődleges, kivonatolás a tartalék ============ */

function extractiveSummarize(articles, maxSentences = 5) {
  const fullText = articles.map((a) => `${a.title}. ${a.desc}`).join(' ');
  const sentences = fullText
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.split(/\s+/).length >= 5);

  const freq = {};
  sentences.forEach((s) => {
    s.toLowerCase().replace(/[^a-záéíóöőúüű0-9\s]/gi, '').split(/\s+/).forEach((w) => {
      if (w.length < 3 || HU_STOPWORDS.has(w)) return;
      freq[w] = (freq[w] || 0) + 1;
    });
  });

  const scored = sentences.map((s, idx) => {
    const words = s.toLowerCase().replace(/[^a-záéíóöőúüű0-9\s]/gi, '').split(/\s+/);
    const score = words.reduce((sum, w) => sum + (freq[w] || 0), 0) / Math.sqrt(words.length + 1);
    return { s, idx, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const picked = scored.slice(0, maxSentences).sort((a, b) => a.idx - b.idx);
  if (!picked.length) return 'Nem sikerült elegendő szöveget kinyerni az összegzéshez.';
  return picked.map((p) => p.s).join(' ');
}

async function summarizeWithGemini(categoryName, articles) {
  if (!GEMINI_API_KEY) throw new Error('Nincs beállítva GEMINI_API_KEY.');
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const list = articles.map((a) => `- [${a.source}] ${a.title}: ${a.desc}`).join('\n');
  const prompt = `Az alábbi friss cikkek alapján írj egy 5-6 mondatos, tényszerű, semleges hangvételű magyar nyelvű összefoglalót "${categoryName}" témakörben. ` +
    `Szintetizáld a lényeget, ne forrásonként sorold fel a híreket. Ha a cikkek ellentmondanak egymásnak, jelezd ezt röviden. ` +
    `Ne használj felsorolásjeleket, folyó szöveget írj.\n\nCikkek:\n${list}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) throw new Error(`Gemini API hiba (${res.status}): ${(await res.text()).slice(0, 200)}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join(' ').trim();
  if (!text) throw new Error('A Gemini nem adott vissza szöveget.');
  return text;
}

async function summarizeCategory(categoryName, articles) {
  try {
    const text = await summarizeWithGemini(categoryName, articles);
    return { text, engine: 'gemini' };
  } catch (err) {
    log(`Gemini összegzés sikertelen (${categoryName}): ${err.message} — kivonatolásra váltok`);
    return { text: extractiveSummarize(articles), engine: 'extractive' };
  }
}

/* ============ EUR/HUF árfolyam ============ */

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

/* ============ Fő folyamat ============ */

async function main() {
  const { sources, categories } = await loadSources();
  const browser = await chromium.launch();

  const articlesByCategory = {};
  const sourcesTried = {};

  for (const source of sources) {
    const items = await collectSourceArticles(source, browser);
    sourcesTried[source.category] = sourcesTried[source.category] || [];
    sourcesTried[source.category].push({ name: source.name, ok: items.length > 0 });
    if (!items.length) continue;
    articlesByCategory[source.category] = (articlesByCategory[source.category] || []).concat(items);
  }

  await browser.close();

  const catResults = {};
  for (const cat of categories) {
    const articles = articlesByCategory[cat.id] || [];
    const triedList = sourcesTried[cat.id] || [];
    const failedNames = triedList.filter((s) => !s.ok).map((s) => s.name);

    if (!articles.length) {
      catResults[cat.id] = {
        error: triedList.length
          ? `Egyik forrás sem adott vissza cikket (${failedNames.join(', ') || 'ismeretlen ok'}).`
          : 'Nincs beállított forrás ehhez a kategóriához.',
        updatedAt: new Date().toISOString(),
      };
      continue;
    }

    const { text, engine } = await summarizeCategory(cat.name, articles);
    const seenSrc = new Set();
    const sourceLinks = [];
    for (const a of articles) {
      if (seenSrc.has(a.source)) continue;
      seenSrc.add(a.source);
      sourceLinks.push({ name: a.source, link: a.link });
    }
    catResults[cat.id] = {
      text,
      engine,
      updatedAt: new Date().toISOString(),
      sourceLinks,
      skipped: failedNames,
    };
  }

  const fx = await fetchFx();

  const output = {
    generatedAt: new Date().toISOString(),
    fx,
    categories: catResults,
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2), 'utf-8');
  log('Kész, kiírva:', OUTPUT_PATH);
}

main().catch((err) => {
  console.error('Végzetes hiba a gyűjtés közben:', err);
  process.exit(1);
});
