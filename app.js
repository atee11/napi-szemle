'use strict';

const CATEGORY_NAMES = {
  politika: 'Politika',
  sport: 'Sport',
  technologia: 'Technológia',
  gazdasag: 'Gazdaság',
  kornyezet: 'Környezet',
  vilaggazdasag: 'Tőzsde / Világgazdaság',
};

const NAME_DAYS = {
  '01-01': 'Fruzsina', '01-02': 'Ábel', '01-03': 'Genovéva', '01-04': 'Titusz', '01-05': 'Simon',
  '01-06': 'Boldizsár', '01-07': 'Attila', '01-08': 'Gyöngyvér', '01-09': 'Marcell', '01-10': 'Melánia',
  '01-11': 'Ágota', '01-12': 'Ernő', '01-13': 'Veronika', '01-14': 'Bódog', '01-15': 'Lóránd',
  '01-16': 'Gusztáv', '01-17': 'Antal', '01-18': 'Piroska', '01-19': 'Sára', '01-20': 'Fábián',
  '01-21': 'Ágnes', '01-22': 'Vince', '01-23': 'Zelma', '01-24': 'Timót', '01-25': 'Pál',
  '01-26': 'Vanda', '01-27': 'Angelika', '01-28': 'Károly', '01-29': 'Adél', '01-30': 'Martina',
  '01-31': 'Marcella', '02-01': 'Ignác', '02-02': 'Karolina', '02-03': 'Balázs', '02-04': 'Ráhel',
  '02-05': 'Ágota', '02-06': 'Dorottya', '02-07': 'Tódor', '02-08': 'Aranka', '02-09': 'Abigél',
  '02-10': 'Elvira', '02-11': 'Bertold', '02-12': 'Lívia', '02-13': 'Ella', '02-14': 'Bálint',
  '02-15': 'Georgina', '02-16': 'Julianna', '02-17': 'Donát', '02-18': 'Bernadett', '02-19': 'Zsuzsanna',
  '02-20': 'Aladár', '02-21': 'Eleonóra', '02-22': 'Gerzson', '02-23': 'Alfréd', '02-24': 'Mátyás',
  '02-25': 'Géza', '02-26': 'Edina', '02-27': 'Ákos', '02-28': 'Elemér', '03-01': 'Albin',
  '03-02': 'Lujza', '03-03': 'Kornélia', '03-04': 'Kázmér', '03-05': 'Adorján', '03-06': 'Leonóra',
  '03-07': 'Tamás', '03-08': 'Zoltán', '03-09': 'Franciska', '03-10': 'Ildikó', '03-11': 'Szilárd',
  '03-12': 'Gergely', '03-13': 'Krisztián', '03-14': 'Matild', '03-15': 'Kristóf', '03-16': 'Henrietta',
  '03-17': 'Gertrúd', '03-18': 'Sándor', '03-19': 'József', '03-20': 'Klaudia', '03-21': 'Benedek',
  '03-22': 'Beáta', '03-23': 'Emőke', '03-24': 'Gábor', '03-25': 'Irén', '03-26': 'Emánuel',
  '03-27': 'Hajnalka', '03-28': 'Johanna', '03-29': 'Auguszta', '03-30': 'Zalán', '03-31': 'Árpád',
  '04-01': 'Hugó', '04-02': 'Áron', '04-03': 'Richárd', '04-04': 'Izidor', '04-05': 'Vince',
  '04-06': 'Vilmos', '04-07': 'Herman', '04-08': 'Dénes', '04-09': 'Erhard', '04-10': 'Zsolt',
  '04-11': 'Leó', '04-12': 'Gyula', '04-13': 'Ida', '04-14': 'Tibor', '04-15': 'Anasztázia',
  '04-16': 'Csongor', '04-17': 'Rudolf', '04-18': 'Andrea', '04-19': 'Emma', '04-20': 'Tivadar',
  '04-21': 'Konrád', '04-22': 'Csilla', '04-23': 'Béla', '04-24': 'György', '04-25': 'Márk',
  '04-26': 'Ervin', '04-27': 'Zita', '04-28': 'Valéria', '04-29': 'Péter', '04-30': 'Katalin',
  '05-01': 'Fülöp', '05-02': 'Zsigmond', '05-03': 'Tímea', '05-04': 'Mónika', '05-05': 'Györgyi',
  '05-06': 'Ivett', '05-07': 'Gizella', '05-08': 'Mihály', '05-09': 'Gergely', '05-10': 'Ármin',
  '05-11': 'Ferenc', '05-12': 'Pongrác', '05-13': 'Szervác', '05-14': 'Bonifác', '05-15': 'Zsófia',
  '05-16': 'Botond', '05-17': 'Paszkál', '05-18': 'Erik', '05-19': 'Ivó', '05-20': 'Bernát',
  '05-21': 'Konstantin', '05-22': 'Júlia', '05-23': 'Dezső', '05-24': 'Eszter', '05-25': 'Orbán',
  '05-26': 'Fülöp', '05-27': 'Hella', '05-28': 'Emil', '05-29': 'Magdolna', '05-30': 'Zsanett',
  '05-31': 'Angéla', '06-01': 'Tünde', '06-02': 'Kármen', '06-03': 'Klotild', '06-04': 'Bulcsú',
  '06-05': 'Fatime', '06-06': 'Norbert', '06-07': 'Róbert', '06-08': 'Medárd', '06-09': 'Félix',
  '06-10': 'Margit', '06-11': 'Barnabás', '06-12': 'Villő', '06-13': 'Antal', '06-14': 'Vazul',
  '06-15': 'Vid', '06-16': 'Jusztin', '06-17': 'Laura', '06-18': 'Arnold', '06-19': 'Gyárfás',
  '06-20': 'Rafael', '06-21': 'Alajos', '06-22': 'Paulina', '06-23': 'Zoltán', '06-24': 'Iván',
  '06-25': 'Vilmos', '06-26': 'János', '06-27': 'László', '06-28': 'Levente', '06-29': 'Péter és Pál',
  '06-30': 'Pál', '07-01': 'Tihamér', '07-02': 'Ottó', '07-03': 'Kornél', '07-04': 'Ulrik',
  '07-05': 'Sarolta', '07-06': 'Csaba', '07-07': 'Apollónia', '07-08': 'Ellák', '07-09': 'Lukrécia',
  '07-10': 'Amália', '07-11': 'Nóra', '07-12': 'Izabella', '07-13': 'Jenő', '07-14': 'Stella',
  '07-15': 'Henrik', '07-16': 'Valter', '07-17': 'Endre', '07-18': 'Frigyes', '07-19': 'Emília',
  '07-20': 'Illés', '07-21': 'Dániel', '07-22': 'Magdolna', '07-23': 'Lenke', '07-24': 'Kinga',
  '07-25': 'Kristóf', '07-26': 'Anna', '07-27': 'Olga', '07-28': 'Szabolcs', '07-29': 'Márta',
  '07-30': 'Judit', '07-31': 'Oszkár', '08-01': 'Boglárka', '08-02': 'Lehel', '08-03': 'Hermina',
  '08-04': 'Domonkos', '08-05': 'Krisztina', '08-06': 'Bettina', '08-07': 'Ibolya', '08-08': 'László',
  '08-09': 'Emőd', '08-10': 'Lőrinc', '08-11': 'Zsuzsanna', '08-12': 'Klára', '08-13': 'Ipoly',
  '08-14': 'Marcell', '08-15': 'Mária', '08-16': 'Ábrahám', '08-17': 'Jácint', '08-18': 'Ilona',
  '08-19': 'Huba', '08-20': 'István', '08-21': 'Sámuel', '08-22': 'Menyhért', '08-23': 'Bence',
  '08-24': 'Bertalan', '08-25': 'Lajos', '08-26': 'Izsó', '08-27': 'Gáspár', '08-28': 'Ágoston',
  '08-29': 'Erna', '08-30': 'Rózsa', '08-31': 'Erika', '09-01': 'Egyed', '09-02': 'Rebeka',
  '09-03': 'Hilda', '09-04': 'Rozália', '09-05': 'Viktor', '09-06': 'Zakariás', '09-07': 'Regina',
  '09-08': 'Adrienn', '09-09': 'Ádám', '09-10': 'Hunor', '09-11': 'Teodóra', '09-12': 'Mária',
  '09-13': 'Kornél', '09-14': 'Szeréna', '09-15': 'Enikő', '09-16': 'Edit', '09-17': 'Zsófia',
  '09-18': 'Diána', '09-19': 'Vilhelmina', '09-20': 'Friderika', '09-21': 'Máté', '09-22': 'Móric',
  '09-23': 'Tekla', '09-24': 'Gellért', '09-25': 'Eufrozina', '09-26': 'Jusztina', '09-27': 'Adalbert',
  '09-28': 'Vencel', '09-29': 'Mihály', '09-30': 'Jeromos', '10-01': 'Malvin', '10-02': 'Petra',
  '10-03': 'Helga', '10-04': 'Ferenc', '10-05': 'Aurél', '10-06': 'Brúnó', '10-07': 'Amália',
  '10-08': 'Koppány', '10-09': 'Dénes', '10-10': 'Gedeon', '10-11': 'Brigitta', '10-12': 'Miksa',
  '10-13': 'Kálmán', '10-14': 'Helén', '10-15': 'Teréz', '10-16': 'Gál', '10-17': 'Hedvig',
  '10-18': 'Lukács', '10-19': 'Nándor', '10-20': 'Vendel', '10-21': 'Orsolya', '10-22': 'Előd',
  '10-23': 'Gyöngyi', '10-24': 'Salamon', '10-25': 'Blanka', '10-26': 'Dömötör', '10-27': 'Szabina',
  '10-28': 'Szimonetta', '10-29': 'Nárcisz', '10-30': 'Alfonz', '10-31': 'Farkas', '11-01': 'Marianna',
  '11-02': 'Achilles', '11-03': 'Győző', '11-04': 'Károly', '11-05': 'Imre', '11-06': 'Lénárd',
  '11-07': 'Rezső', '11-08': 'Zsombor', '11-09': 'Tivadar', '11-10': 'Réka', '11-11': 'Márton',
  '11-12': 'Jónás', '11-13': 'Szilvia', '11-14': 'Aliz', '11-15': 'Albert', '11-16': 'Ödön',
  '11-17': 'Hortenzia', '11-18': 'Jenő', '11-19': 'Erzsébet', '11-20': 'Jolán', '11-21': 'Olivér',
  '11-22': 'Cecília', '11-23': 'Klementina', '11-24': 'Emma', '11-25': 'Katalin', '11-26': 'Virág',
  '11-27': 'Virgil', '11-28': 'Stefánia', '11-29': 'Taksony', '11-30': 'András', '12-01': 'Elza',
  '12-02': 'Melinda', '12-03': 'Ferenc', '12-04': 'Borbála', '12-05': 'Vilma', '12-06': 'Miklós',
  '12-07': 'Ambrus', '12-08': 'Mária', '12-09': 'Natália', '12-10': 'Judit', '12-11': 'Árpád',
  '12-12': 'Gabriella', '12-13': 'Luca', '12-14': 'Szilárda', '12-15': 'Valér', '12-16': 'Etelka',
  '12-17': 'Lázár', '12-18': 'Auguszta', '12-19': 'Viola', '12-20': 'Teofil', '12-21': 'Tamás',
  '12-22': 'Zénó', '12-23': 'Viktória', '12-24': 'Ádám és Éva', '12-25': 'Eugénia', '12-26': 'István',
  '12-27': 'János', '12-28': 'Kamilla', '12-29': 'Tamás', '12-30': 'Dávid', '12-31': 'Szilveszter',
};

function todayNameDay() {
  const now = new Date();
  const key = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  return NAME_DAYS[key] || null;
}

function escapeHtml(str) {
  const d = document.createElement('div');
  d.textContent = str == null ? '' : String(str);
  return d.innerHTML;
}
function escapeAttr(str) { return escapeHtml(str).replace(/"/g, '&quot;'); }

function timeAgo(iso) {
  if (!iso) return '';
  const diffMin = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (diffMin < 1) return 'most frissült';
  if (diffMin < 60) return `${diffMin} perce frissült`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} órája frissült`;
  return `${Math.round(diffH / 24)} napja frissült`;
}

function renderMastheadMeta() {
  const now = new Date();
  const dateStr = now.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
  const nameDay = todayNameDay();
  document.getElementById('masthead-meta').textContent = nameDay ? `${dateStr} · ${nameDay} napja` : dateStr;
}

function renderTicker(categoryIds) {
  const el = document.getElementById('ticker');
  const items = categoryIds.map((id) => `<span>${escapeHtml((CATEGORY_NAMES[id] || id).toUpperCase())}</span>`).join('');
  if (!items) { el.innerHTML = ''; return; }
  el.innerHTML = `<span class="ticker-track">${items}${items}</span>`;
}

function renderFxStrip(fx) {
  const el = document.getElementById('fxStripText');
  if (!fx) { el.textContent = 'EUR/HUF árfolyam jelenleg nem elérhető.'; return; }
  const rate = Number(fx.rate).toFixed(2).replace('.', ',');
  const timeStr = fx.date
    ? new Date(fx.date).toLocaleString('hu-HU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
    : '';
  el.innerHTML = `EUR/HUF <strong>${rate} Ft</strong> · ${escapeHtml(fx.source || '')} · ${escapeHtml(timeStr)}`;
}

function summaryItemsHtml(items) {
  if (!items || !items.length) return '';
  return items.map((it) => {
    const label = it.source
      ? (it.link
          ? `<a class="source-pill" href="${escapeAttr(it.link)}" target="_blank" rel="noopener">${escapeHtml(it.source)}</a>`
          : `<span class="source-pill">${escapeHtml(it.source)}</span>`)
      : '';
    return `<p class="summary-item">${escapeHtml(it.text)} ${label}</p>`;
  }).join('');
}

function cardHtml(categoryId, data) {
  const name = CATEGORY_NAMES[categoryId] || categoryId;

  if (!data) {
    return `<article class="category-card">
      <div class="card-top"><div><p class="eyebrow">Rovat</p><h2 class="category-name">${escapeHtml(name)}</h2></div></div>
      <p class="card-summary placeholder">Erre a kategóriára még nincs adat.</p>
    </article>`;
  }

  if (data.error && !(data.items && data.items.length)) {
    return `<article class="category-card">
      <div class="card-top"><div><p class="eyebrow">Rovat</p><h2 class="category-name">${escapeHtml(name)}</h2></div></div>
      <p class="card-summary error">${escapeHtml(data.error)}</p>
      <p class="timestamp">${timeAgo(data.updatedAt)}</p>
    </article>`;
  }

  const stampClass = data.engine === 'extractive' ? ' extractive' : '';
  const stampText = data.engine === 'gemini' ? 'AI összefoglaló · Gemini' : 'Kivonat · tartalék módszer';
  const chips = (data.sourceLinks || []).map((s) =>
    `<a class="source-chip" href="${escapeAttr(s.link)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a>`
  ).join('');
  const warn = data.skipped && data.skipped.length
    ? `<p class="card-warning">${data.skipped.length} forrás nem adott vissza cikket: ${escapeHtml(data.skipped.join(', '))}</p>`
    : '';

  return `<article class="category-card">
    <span class="stamp${stampClass}">${escapeHtml(stampText)}</span>
    <div class="card-top"><div><p class="eyebrow">Rovat</p><h2 class="category-name">${escapeHtml(name)}</h2></div></div>
    <div class="summary-list">${summaryItemsHtml(data.items)}</div>
    <div class="card-meta"><span class="timestamp">${timeAgo(data.updatedAt)}</span></div>
    <div class="source-chips">${chips}</div>
    ${warn}
  </article>`;
}

function render(dataObj) {
  const categories = dataObj.categories || {};
  const ids = Object.keys(CATEGORY_NAMES).filter((id) => categories[id]);
  renderTicker(ids.length ? ids : Object.keys(CATEGORY_NAMES));
  renderFxStrip(dataObj.fx);

  const stack = document.getElementById('cardStack');
  stack.innerHTML = ids.map((id) => cardHtml(id, categories[id])).join('')
    || '<p class="card-summary placeholder">Még nincs adat — az első automatikus futás után jelenik meg tartalom.</p>';

  const status = document.getElementById('footerStatus');
  if (dataObj.generatedAt) {
    const d = new Date(dataObj.generatedAt);
    const datePart = d.toLocaleDateString('hu-HU', { year: 'numeric', month: '2-digit', day: '2-digit' });
    const timePart = d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    status.textContent = `Frissítve: ${datePart} ${timePart}`;
  } else {
    status.textContent = 'Frissítés ideje ismeretlen';
  }
}

async function loadData() {
  const status = document.getElementById('footerStatus');
  try {
    const res = await fetch('data/summaries.json?t=' + Date.now());
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    render(data);
  } catch (err) {
    status.textContent = 'Nem sikerült betölteni az adatokat: ' + err.message;
  }
}

function openInfo() { document.getElementById('overlay').hidden = false; document.getElementById('infoPanel').hidden = false; }
function closeInfo() { document.getElementById('overlay').hidden = true; document.getElementById('infoPanel').hidden = true; }

function init() {
  renderMastheadMeta();
  document.getElementById('footerYear').textContent = new Date().getFullYear();
  loadData();

  document.getElementById('infoBtn').addEventListener('click', openInfo);
  document.getElementById('closeInfoBtn').addEventListener('click', closeInfo);
  document.getElementById('overlay').addEventListener('click', closeInfo);
  document.getElementById('manualRefreshBtn').addEventListener('click', loadData);
}

document.addEventListener('DOMContentLoaded', init);
