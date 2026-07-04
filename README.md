# Napi Szemle — AI hírösszefoglaló (backend nélküli szerver, GitHub Actionsszel)

Ez a verzió már nem a böngészőben gyűjti a híreket, hanem egy **ütemezett GitHub Actions job** végzi a háttérben:

1. Minden forráshoz megpróbál RSS-t olvasni.
2. Ha egy oldalnál nincs RSS vagy üres, **Playwrighttal** (headless böngésző) generikusan kiolvassa a főoldal linkjeit tartalék módszerként.
3. Kategóriánként (politika, sport, technológia, gazdaság, környezet) a **Google Gemini API**-val 5-6 mondatos összefoglalót ír.
4. Lekéri az EUR/HUF árfolyamot (Yahoo Finance, tartalék: ECB/Frankfurter).
5. Mindezt egy `data/summaries.json` fájlba írja, és visszacommitolja a repóba.

A weboldal (`index.html`) ezt a JSON-t olvassa ki — a böngészőben **semmilyen API-hívás vagy hírgyűjtés nem történik**, nincs szükség semmilyen kulcsra a látogató oldalán.

## 1. Beüzemelés lépésről lépésre

1. **Hozz létre egy publikus GitHub repót**, és töltsd fel ennek a mappának minden fájlját és almappáját (`index.html`, `styles.css`, `app.js`, `manifest.json`, `.nojekyll`, `sources.json`, `package.json`, `data/`, `scripts/`, `icons/`, `.github/`).
   - Fontos: a `.github/workflows/update-news.yml` fájlnak is fel kell kerülnie — GitHub-on drag & drop feltöltésnél ügyelj rá, hogy a rejtett `.github` és `.nojekyll` fájlok is bekerüljenek (ha nem, könnyebb `git`-tel feltölteni, lásd lentebb).
2. **Szerezz egy ingyenes Gemini API-kulcsot**: https://aistudio.google.com/apikey
3. **Add hozzá titkos változóként**: repó → Settings → Secrets and variables → Actions → "New repository secret" → Name: `GEMINI_API_KEY`, Value: a kulcsod.
4. **Kapcsold be a GitHub Pages-t**: Settings → Pages → Branch: `main`, mappa: `/ (root)` → Save.
5. **Indítsd el kézzel az első futást**: repó → Actions fül → "Hírek gyűjtése és összegzése" workflow → "Run workflow". Ez pár perc alatt lefut, és commitol egy friss `data/summaries.json`-t.
6. Nyisd meg a Pages linket (`https://felhasznalonev.github.io/repo-nev/`) — ekkorra már a valódi, friss híreket kell látnod.

Ezután a workflow **automatikusan, naponta kétszer** (05:00 és 15:00 UTC, kb. reggel és kora délután magyar idő szerint) lefut magától is, nem kell hozzányúlnod.

### Ha git paranccsal töltöd fel (ajánlott, hogy a rejtett fájlok is bekerüljenek)

```bash
cd napi-szemle-v2
git init
git add -A
git commit -m "Első feltöltés"
git branch -M main
git remote add origin https://github.com/FELHASZNALONEVED/REPO-NEVED.git
git push -u origin main
```

## 2. Források szerkesztése

A `sources.json` fájlban lehet hírportált hozzáadni, törölni vagy kategóriát váltani neki:

```json
{ "name": "Új Portál", "rss": "https://pelda.hu/rss", "scrapeUrl": "https://pelda.hu/", "category": "kornyezet" }
```

- `rss`: az elsődlegesen próbált RSS-cím.
- `scrapeUrl`: ha az RSS nem működik, ezt az oldalt nyitja meg Playwrighttal, és a linkelt címekből próbál híreket kinyerni (ez egy generikus, nem oldalra szabott módszer, ezért néha pontatlanabb, mint egy valódi RSS).
- `category`: `politika`, `sport`, `technologia`, `gazdasag` vagy `kornyezet`.

Mentés/push után a workflow a legközelebbi futáskor (vagy ha rögtön futtatod kézzel az Actions fülön) már ezt használja.

## 3. Hibaelhárítás

- **A repó "About" leírása jelenik meg a weboldal helyett**: ez azt jelenti, hogy GitHub Pages Jekyll-lel próbálja feldolgozni az oldalt, és nem találja az `index.html`-t a megfelelő helyen. Ellenőrizd, hogy az `index.html` a repó **gyökerében** van-e (nem egy alkönyvtárban), és hogy a `.nojekyll` fájl is fel lett-e töltve.
- **A hírek nem frissülnek**: nézd meg a repó Actions fülén a legutóbbi futás logját — ott soronként látszik, melyik forrásnál mi történt (RSS sikeres/sikertelen, Playwright fallback eredménye, Gemini hívás eredménye).
- **"Nincs beállított GEMINI_API_KEY" hiba**: ellenőrizd, hogy a Secret neve pontosan `GEMINI_API_KEY`, és hogy repó-szintű (nem environment-szintű) secretként van felvéve.
- A Playwright telepítése (`npx playwright install --with-deps chromium`) az Actions futás egy részét lassabbá teszi (1-2 perc) — ez normális.
