# ⚙️ Kalkulator mjernih pločica / Gauge Block Calculator / Endmaß-Rechner

**Live:** https://kikiriki321.github.io/etaloni/ — radi u pregledniku, offline i kao instalirana aplikacija (PWA).

Egzaktan izračun kombinacija paralelnih mjernih pločica (etalona). Ako kombinacija postoji, alat je garantirano pronalazi; ako je nema, kaže to s matematičkim dokazom i predlaže najbliže dostižne dimenzije.

📖 **Čitaj na:** [🇭🇷 Hrvatski](#-hrvatski) · [🇬🇧 English](#-english) · [🇩🇪 Deutsch](#-deutsch) · [📋 Changelog](#-changelog)

---

## 🇭🇷 Hrvatski

### Značajke

- **8 setova pločica** — metrički 32 / 47 / 87 / 103 kom i inčni Mitutoyo 516: 81 / 35 / 28 / 10 kom. Jedinica (mm ili inch) izvodi se iz seta; miješanje je strukturno nemoguće.
- **Egzaktan algoritam** — DP subset-sum dokazuje dostižnost i najmanji broj pločica, a alternative se enumeriraju po točnom broju pločica: "nije moguće" znači *dokazano* nemoguće s dostupnim pločicama.
- **Isključivanje pločica** — klikom na pločicu u info prozoru označiš je kao izgubljenu, oštećenu ili na umjeravanju. Izračun je ne koristi, maksimum seta se prilagođava, stanje se pamti po setu.
- **Uživo upozorenja ispod polja** — dok tipkaš: prelazi maksimum, nije višekratnik koraka seta, nedostižno (s najbližim dostižnim vrijednostima gore/dolje).
- **Preporučena kombinacija** = najmanje pločica (manje slaganja, manja pogreška). Alternative se prikazuju samo ako imaju najviše jednu pločicu više od najkraće.
- **Povijest** zadnjih 5 pretraga, odvojeno za mm i inch; klik na čip ponavlja izračun.
- **Kopiranje** kombinacije u međuspremnik u čitljivom obliku (`1.005 + 1.38 + 45 = 47.385 mm`).
- **Tri jezika** (HR / EN / DE), **tamna i svijetla tema** — početna prati postavku sustava, ručni odabir se pamti.
- **Offline i instalabilno** — service worker + web manifest; "Dodaj na početni zaslon" daje aplikaciju bez adresne trake.
- **Pristupačnost** — Enter = izračunaj, Escape = zatvori; fokus ostaje u info prozoru i vraća se na gumb pri zatvaranju; rezultati se najavljuju čitačima ekrana.

### Kako radi (ukratko)

Sve vrijednosti pretvaraju se u cijele brojeve (0.001 mm odnosno 0.00001") pa nema floating-point pogrešaka. Za svaki set računa se najveći zajednički djelitelj (gcd) svih pločica — to je fizička granularnost seta (npr. 0.005 mm za 103-set, 0.001 mm za 87-set) i sve što nije njegov višekratnik odbija se odmah. DP tablica dostižnosti i minimalnog broja pločica gradi se jednom po kombinaciji *set + isključene pločice* (u pozadini, u idle vremenu preglednika). Nakon toga se alternative traže samo za egzaktno minimalan broj pločica i jednu pločicu više, pa limit rezultata ne može sakriti kraće kombinacije.

### Struktura repozitorija

| Datoteka | Uloga |
|---|---|
| `index.html` | Sučelje, prijevodi, prikaz — sav CSS i UI JS u jednoj datoteci |
| `solver.js` | Definicije setova i jedinica + cijeli algoritam. Bez DOM-a; radi u pregledniku (`window.GaugeSolver`) i u Nodeu |
| `test.js` | Testovi algoritma (`node test.js`) |
| `ui-test.js` | Smoke test stvarnog HTML prikaza za regresiju 100 mm / 87 kom (`node ui-test.js`) |
| `sw.js` | Service worker — offline rad, network-first strategija |
| `manifest.json` | Web manifest za instalaciju kao aplikacija |
| `icon.svg`, `icon-192.png`, `icon-512.png` | Ikone aplikacije |



### Testovi

```bash
node test.js
node ui-test.js
```

`test.js` za svaki set prolazi **sve** dostižne vrijednosti do maksimuma seta (npr. 715 296 ciljeva za 87-set) i provjerava zbroj, jedinstvenost pločica, egzaktni minimum, najbliže dostižne vrijednosti, ograničenje alternativa i isključivanje pločica. `ui-test.js` zatim izvršava stvarni skript iz `index.html` u minimalnom DOM-u i zahtijeva poruku o pet kombinacija te prikaz svih pet rješenja za 100 mm / 87 kom.

### Objava nove verzije

1. Promijeni kod.
2. Povećaj `CACHE_NAME` u `sw.js` (npr. `etaloni-v3.3` → `etaloni-v3.4`) i `versionLabel` u prijevodima u `index.html`.
3. Pokreni `node test.js` i `node ui-test.js` — oba moraju proći.
4. Push na GitHub. GitHub Pages objavljuje za 1–3 minute; postojeći korisnici dobivaju novu verziju pri sljedećem učitavanju (network-first), stari keš se automatski briše.

### Lokalno pokretanje

Otvaranje `index.html` izravno s diska radi (bez service workera). 

## 🇬🇧 English

Exact gauge block combination calculator. Supports metric sets (32 / 47 / 87 / 103 pcs) and Mitutoyo 516 inch sets (81 / 35 / 28 / 10 pcs). If a combination exists it is guaranteed to be found; otherwise the tool proves it impossible and shows the nearest reachable dimensions above and below.

**Features:** exclude lost/damaged blocks per set · live hints while typing (over maximum, off the set's step, unreachable + nearest values) · recommended = fewest blocks, alternatives limited to at most one extra block · search history per unit · copy to clipboard · HR / EN / DE · dark/light theme following the system setting · works offline and installs as a PWA · keyboard shortcuts (Enter / Escape), focus management and screen-reader announcements.

**How it works:** all values are integers (0.001 mm / 0.00001") — no floating-point error. The gcd of every set's blocks is its physical granularity; non-multiples are rejected instantly. A subset-sum DP table proves reachability and the exact minimum block count. Alternatives are then enumerated by exact length, so a result limit cannot hide shorter combinations.

**Repository:** `index.html` (UI) · `solver.js` (sets + algorithm, DOM-free, works in Node) · `test.js` (exhaustive algorithm tests) · `ui-test.js` (HTML result smoke test) · `sw.js` (service worker, network-first) · `manifest.json` + icons. Every runtime file listed in the service worker's `ASSETS` array must be deployed together.

**Releasing:** bump `CACHE_NAME` in `sw.js` and `versionLabel` in `index.html`, run `node test.js` and `node ui-test.js`, then push.

---

## 🇩🇪 Deutsch

Exakter Endmaß-Kombinationsrechner. Unterstützt metrische Sätze (32 / 47 / 87 / 103 Stk.) und Mitutoyo-516-Zollsätze (81 / 35 / 28 / 10 Stk.). Existiert eine Kombination, wird sie garantiert gefunden; andernfalls beweist das Werkzeug die Unmöglichkeit und zeigt die nächsten erreichbaren Maße darüber und darunter.

**Funktionen:** Ausschluss verlorener/beschädigter Endmaße pro Satz · Live-Hinweise beim Tippen (über Maximum, nicht auf der Satzstufe, unerreichbar + nächste Werte) · Empfehlung = wenigste Endmaße, Alternativen mit höchstens einem Endmaß mehr · Suchverlauf pro Einheit · Kopieren in die Zwischenablage · HR / EN / DE · dunkles/helles Design nach Systemeinstellung · offline und als PWA installierbar · Tastenkürzel (Enter / Escape), Fokusführung und Screenreader-Ansagen.

**Funktionsweise:** alle Werte sind Ganzzahlen (0,001 mm / 0,00001") — keine Gleitkommafehler. Der ggT aller Endmaße eines Satzes ist seine physikalische Granularität; Nicht-Vielfache werden sofort abgelehnt. Eine Subset-Sum-DP-Tabelle beweist die Erreichbarkeit und die exakte Mindestanzahl der Endmaße. Alternativen werden danach nach exakter Länge aufgezählt, sodass ein Ergebnislimit keine kürzeren Kombinationen verbergen kann.

**Repository:** `index.html` (Oberfläche) · `solver.js` (Sätze + Algorithmus, ohne DOM, läuft in Node) · `test.js` (vollständige Algorithmustests) · `ui-test.js` (Smoke-Test der HTML-Ergebnisse) · `sw.js` (Service Worker, network-first) · `manifest.json` + Icons. Alle in `ASSETS` aufgeführten Laufzeitdateien müssen gemeinsam veröffentlicht werden.

**Neue Version:** `CACHE_NAME` in `sw.js` und `versionLabel` in `index.html` erhöhen, `node test.js` und `node ui-test.js` ausführen, dann pushen.

---

## 📋 Changelog

### [3.0] – 2026

**Ispravci**
- Alternative se sada pretražuju po egzaktnom broju pločica. Limit od 100 više se ne može popuniti dugim kombinacijama prije nego algoritam dođe do kraćih.
- Za 100 mm i set od 87 pločica vraća se svih pet praktičnih rješenja: `100`, `90+10`, `80+20`, `70+30`, `60+40`.
- DP tablica sada izračunava i stvarni minimalni broj pločica, pa je oznaka "Preporučeno" egzaktna i za velike dimenzije.
- Kartica s brojem pronađenih praktičnih kombinacija prikazuje se uvijek, uključujući slučajeve s manje od 10 rezultata.
- Sučelje razlikuje potpuni popis od ograničenog (`Pronađeno najmanje ...`) i više ne tvrdi da prikazuje "sve" kada je dosegnut limit.
- Lijepljeni unos sada prolazi istu normalizaciju i ograničenje decimala kao tipkani unos; više točaka ne može se tiho protumačiti kao druga vrijednost.
- Promjena seta ili isključivanje pločice poništava zastarjele rezultate i zaustavlja prethodno zakazani izračun; promjena jezika odmah prevodi već prikazane rezultate.

**Testovi**
- Dodani regresijski testovi za 100 mm / 87 kom, status potpunog odnosno skraćenog popisa i stvarno generirani HTML rezultata.

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
