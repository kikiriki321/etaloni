# ⚙️ Kalkulator mjernih pločica / Gauge Block Calculator / Endmaß-Rechner

**Live:** https://kikiriki321.github.io/etaloni/ — radi u pregledniku, offline i kao instalirana aplikacija (PWA).

Egzaktan izračun kombinacija paralelnih mjernih pločica (etalona). Ako kombinacija postoji, alat je garantirano pronalazi; ako je nema, kaže to s matematičkim dokazom i predlaže najbliže dostižne dimenzije.

📖 **Čitaj na:** [🇭🇷 Hrvatski](#-hrvatski) · [🇬🇧 English](#-english) · [🇩🇪 Deutsch](#-deutsch) · [📋 Changelog](#-changelog)

---

## 🇭🇷 Hrvatski

### Značajke

- **8 setova pločica** — metrički 32 / 47 / 87 / 103 kom i inčni Mitutoyo 516: 81 / 35 / 28 / 10 kom. Jedinica (mm ili inch) izvodi se iz seta; miješanje je strukturno nemoguće.
- **Egzaktan algoritam** — brzi heuristički rješavač za tipične slučajeve, DFS za alternative i DP subset-sum kao garancija: "nije moguće" znači *dokazano* nemoguće s dostupnim pločicama.
- **Isključivanje pločica** — klikom na pločicu u info prozoru označiš je kao izgubljenu, oštećenu ili na umjeravanju. Izračun je ne koristi, maksimum seta se prilagođava, stanje se pamti po setu.
- **Uživo upozorenja ispod polja** — dok tipkaš: prelazi maksimum, nije višekratnik koraka seta, nedostižno (s najbližim dostižnim vrijednostima gore/dolje).
- **Preporučena kombinacija** = najmanje pločica (manje slaganja, manja pogreška). Alternative se prikazuju samo ako imaju najviše jednu pločicu više od najkraće.
- **Povijest** zadnjih 5 pretraga, odvojeno za mm i inch; klik na čip ponavlja izračun.
- **Kopiranje** kombinacije u međuspremnik u čitljivom obliku (`1.005 + 1.38 + 45 = 47.385 mm`).
- **Tri jezika** (HR / EN / DE), **tamna i svijetla tema** — početna prati postavku sustava, ručni odabir se pamti.
- **Offline i instalabilno** — service worker + web manifest; "Dodaj na početni zaslon" daje aplikaciju bez adresne trake.
- **Pristupačnost** — Enter = izračunaj, Escape = zatvori; fokus ostaje u info prozoru i vraća se na gumb pri zatvaranju; rezultati se najavljuju čitačima ekrana.

### Kako radi (ukratko)

Sve vrijednosti pretvaraju se u cijele brojeve (0.001 mm odnosno 0.00001") pa nema floating-point pogrešaka. Za svaki set računa se najveći zajednički djelitelj (gcd) svih pločica — to je fizička granularnost seta (npr. 0.005 mm za 103-set, 0.001 mm za 87-set) i sve što nije njegov višekratnik odbija se odmah. DP tablica dostižnosti gradi se jednom po kombinaciji *set + isključene pločice* (u pozadini, u idle vremenu preglednika) i zatim je svaki upit trenutan.

### Struktura repozitorija

| Datoteka | Uloga |
|---|---|
| `index.html` | Sučelje, prijevodi, prikaz — sav CSS i UI JS u jednoj datoteci |
| `solver.js` | Definicije setova i jedinica + cijeli algoritam. Bez DOM-a; radi u pregledniku (`window.GaugeSolver`) i u Nodeu |
| `test.js` | Testovi algoritma (`node test.js`) |
| `sw.js` | Service worker — offline rad, network-first strategija |
| `manifest.json` | Web manifest za instalaciju kao aplikacija |
| `icon.svg`, `icon-192.png`, `icon-512.png` | Ikone aplikacije |

> ⚠️ Svih 8 datoteka mora biti u istom direktoriju na poslužitelju. Service worker pri instalaciji povlači sve iz svoje `ASSETS` liste; ako jedna nedostaje (404), instalacija pada i offline rad ne radi.

### Testovi

```bash
node test.js
```

Za svaki set prolazi **sve** dostižne vrijednosti do maksimuma seta (npr. 715 296 ciljeva za 87-set) i provjerava: zbroj kombinacije, da se nijedna pločica ne ponavlja, da su "najbliže" vrijednosti stvarno najbliže i dostižne, da heuristički rješavač i DFS nikad ne vraćaju nevaljanu kombinaciju, filtar alternativa i isključivanje pločica. ~150 000 provjera, oko 10 s.

### Objava nove verzije

1. Promijeni kod.
2. Povećaj `CACHE_NAME` u `sw.js` (npr. `etaloni-v3.2` → `etaloni-v3.3`) i `versionLabel` u prijevodima u `index.html`.
3. Pokreni `node test.js` — mora ispisati `0 grešaka`.
4. Push na GitHub. GitHub Pages objavljuje za 1–3 minute; postojeći korisnici dobivaju novu verziju pri sljedećem učitavanju (network-first), stari keš se automatski briše.

### Lokalno pokretanje

Otvaranje `index.html` izravno s diska radi (bez service workera). Za test offline rada i instalacije potreban je HTTPS ili `localhost`:

```bash
python3 -m http.server 8000
# zatim http://localhost:8000
```

---

## 🇬🇧 English

Exact gauge block combination calculator. Supports metric sets (32 / 47 / 87 / 103 pcs) and Mitutoyo 516 inch sets (81 / 35 / 28 / 10 pcs). If a combination exists it is guaranteed to be found; otherwise the tool proves it impossible and shows the nearest reachable dimensions above and below.

**Features:** exclude lost/damaged blocks per set · live hints while typing (over maximum, off the set's step, unreachable + nearest values) · recommended = fewest blocks, alternatives limited to at most one extra block · search history per unit · copy to clipboard · HR / EN / DE · dark/light theme following the system setting · works offline and installs as a PWA · keyboard shortcuts (Enter / Escape), focus management and screen-reader announcements.

**How it works:** all values are integers (0.001 mm / 0.00001") — no floating-point error. The gcd of every set's blocks is its physical granularity; non-multiples are rejected instantly. A subset-sum DP table is built once per *set + exclusions* in idle time, after which every query is instant.

**Repository:** `index.html` (UI) · `solver.js` (sets + algorithm, DOM-free, works in Node) · `test.js` (`node test.js`, exhaustive verification of every reachable value in every set) · `sw.js` (service worker, network-first) · `manifest.json` + icons. All 8 files must be deployed together — the service worker precaches all of them and fails to install if one is missing.

**Releasing:** bump `CACHE_NAME` in `sw.js` and `versionLabel` in `index.html`, run `node test.js`, push.

---

## 🇩🇪 Deutsch

Exakter Endmaß-Kombinationsrechner. Unterstützt metrische Sätze (32 / 47 / 87 / 103 Stk.) und Mitutoyo-516-Zollsätze (81 / 35 / 28 / 10 Stk.). Existiert eine Kombination, wird sie garantiert gefunden; andernfalls beweist das Werkzeug die Unmöglichkeit und zeigt die nächsten erreichbaren Maße darüber und darunter.

**Funktionen:** Ausschluss verlorener/beschädigter Endmaße pro Satz · Live-Hinweise beim Tippen (über Maximum, nicht auf der Satzstufe, unerreichbar + nächste Werte) · Empfehlung = wenigste Endmaße, Alternativen mit höchstens einem Endmaß mehr · Suchverlauf pro Einheit · Kopieren in die Zwischenablage · HR / EN / DE · dunkles/helles Design nach Systemeinstellung · offline und als PWA installierbar · Tastenkürzel (Enter / Escape), Fokusführung und Screenreader-Ansagen.

**Funktionsweise:** alle Werte sind Ganzzahlen (0,001 mm / 0,00001") — keine Gleitkommafehler. Der ggT aller Endmaße eines Satzes ist seine physikalische Granularität; Nicht-Vielfache werden sofort abgelehnt. Eine Subset-Sum-DP-Tabelle wird einmal pro *Satz + Ausschlüsse* im Leerlauf aufgebaut, danach ist jede Abfrage sofort.

**Repository:** `index.html` (Oberfläche) · `solver.js` (Sätze + Algorithmus, ohne DOM, läuft in Node) · `test.js` (`node test.js`, vollständige Prüfung jedes erreichbaren Werts in jedem Satz) · `sw.js` (Service Worker, network-first) · `manifest.json` + Icons. Alle 8 Dateien müssen gemeinsam veröffentlicht werden — der Service Worker cached sie alle vor und schlägt fehl, wenn eine fehlt.

**Neue Version:** `CACHE_NAME` in `sw.js` und `versionLabel` in `index.html` erhöhen, `node test.js` ausführen, pushen.

---

## 📋 Changelog

### [3.2.0] – 2026

**Struktura i testovi**
- Algoritam i definicije setova izdvojeni u `solver.js` (bez DOM-a, radi u pregledniku i Nodeu).
- Dodan `test.js`: iscrpna provjera svake dostižne vrijednosti u svakom setu.

**Ispravci**
- Service worker keširao je i neuspješne odgovore (404/500) i time mogao pregaziti ispravnu offline kopiju — sada se keširaju samo uspješni odgovori istog origina.
- Info kartica za raspon 100–200 mm prikazivala je doslovno `{t1}–{t2}` umjesto vrijednosti.
- Promjena seta više ne otvara tipkovnicu na mobitelu.
- Povijest pretraga normalizirana (`47` umjesto `47.000`).

**Novo**
- Instalabilna PWA: `manifest.json` i ikone; "Dodaj na početni zaslon".
- Početna tema prati `prefers-color-scheme`; ručni odabir i dalje ima prednost.
- DP tablica dostižnosti gradi se jednom po konfiguraciji u pozadini i kešira — svaki upit trenutan.
- Uživo upozorenje "Nedostižno — najbliže: X / Y" ispod polja za unos, bez blokiranja tipkanja.
- Alternative ograničene na najviše jednu pločicu više od najkraće kombinacije (umjesto do 100 kombinacija s 4–5 pločica).
- Pristupačnost: `lang` atribut prati jezik, fokus zadržan u modalu i vraćen pri zatvaranju, rezultati kao `aria-live`.
- Uklonjeno upozorenje "blizu maksimuma" (bez praktične vrijednosti).

### [3.1.0] – 2026 *(rekonstruirano iz koda)*
- Granularnost seta (gcd): vrijednosti izvan koraka seta odbijaju se odmah s napomenom; DP prostor komprimiran gcd-om (10× manje memorije za inčni 81-set).
- Kataloška notacija za inčne setove (`.1001`, `.05`, `1`).

### [3.0.0] – 2026 *(rekonstruirano iz koda)*
- Više setova: metrički 32 / 47 / 87 / 103 i inčni Mitutoyo 516 (81 / 35 / 28 / 10). Jedinica se izvodi iz seta.
- Isključivanje pojedinih pločica (izgubljene, oštećene, na umjeravanju) s pamćenjem po setu.
- DP subset-sum kao garancija dostižnosti; "nije moguće" = matematički dokazano.
- Najbliže dostižne dimenzije gore i dolje.
- Povijest pretraga odvojena po jedinici; service worker za offline rad.

### [2.0.0] – 2026
- Cjelobrojna aritmetika (×1000) — uklonjene floating-point greške.
- Validacija 0 i negativnih vrijednosti.
- Pamćenje teme i jezika; povijest zadnjih 5 pretraga; kopiranje u međuspremnik; gumb ✕ za brisanje; inline hint; sanitizacija lijepljenja; toast obavijesti; prečaci Enter / Escape.
- Legenda boja, monospace prikaz, meta/SEO tagovi.

### [1.2.0] – 2025
- Njemački prijevod; responzivan dizajn za mobilne uređaje; obojeni chipovi u info prozoru.

### [1.1.0] – 2025
- Tamna i svijetla tema; višejezičnost (HR, EN); info prozor s popisom pločica.

### [1.0.0] – 2025
- Početno izdanje: DFS pretraga, vizualni prikaz kombinacija, unos s točkom ili zarezom.

---

**Autor:** Josip Sinković · motorola10@gmail.com
*Program napravljen za kolege koji ne znaju računati napamet! 😄*
