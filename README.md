# 📋 Izmjene / Changelog / Änderungsprotokoll

📖 **Čitaj na:** [🇭🇷 Hrvatskom](#-hrvatski) | [🇬🇧 English](#-english) | [🇩🇪 Deutsch](#-deutsch)

---

## 🇭🇷 Hrvatski



---

### [2.0.0] – 2026

#### 🐛 Ispravci grešaka

**Floating-point preciznost**
JavaScript koristi 64-bitne decimalne brojeve (IEEE 754), pa operacije poput `0.1 + 0.2` ne daju točno `0.3`, već `0.30000000000000004`. Ovo je moglo uzrokovati propuštanje valjanih kombinacija ili netočne zbroje.

Rješenje: sve vrijednosti pločica i unesena dimenzija pretvaraju se u cijele brojeve množenjem s `1000` (npr. `1.005 mm` → `1005`). Sva aritmetika provodi se s cijelim brojevima, a rezultati se dijele s `1000` tek pri prikazu.

```js
// v1.2 – mogući floating-point error
const gaugeBlocks = [100, 90, ..., 1.005, ..., 0.5];

// v2.0 – točno, bez zaokruživanja
const gaugeBlocks = gaugeBlocksRaw.map(b => Math.round(b * 1000));
const targetInt   = Math.round(target * 1000);
```

**Validacija rubnih slučajeva**
Unos vrijednosti `0` ili negativnih brojeva više ne prolazi validaciju tiho — prikazuje se zasebna, jasna poruka greške.

---

#### ✨ Nova funkcionalnost

**Pamćenje teme i jezika**
Odabrana tema (tamna/svijetla) i jezik (HR/EN/DE) pamte se između posjeta pomoću `localStorage`. Više nema vraćanja na zadane postavke pri osvježavanju stranice.

**Povijest nedavnih pretraga**
Zadnjih 5 uspješnih pretraga prikazuju se kao klikabilni chipovi ispod polja za unos. Klikom na chip polje se automatski popunjava i pokreće izračun — korisno za ponavljajuće dimenzije.

**Kopiranje kombinacije u međuspremnik**
Svaka kombinacija ima gumb 📋 Kopiraj koji sprema rezultat u čitljivom obliku, npr.:
```
1.005 + 1.38 + 45.0 = 47.385 mm
```
Implementiran je i fallback za starije preglednike koji ne podržavaju `navigator.clipboard`.

**Gumb za brisanje unosa (✕)**
Pojavljuje se unutar polja čim korisnik počne tipkati. Klikom briše sadržaj i vraća fokus — brže od ručnog označavanja i brisanja.

**Inline hint ispod polja za unos**
Kratke napomene prikazuju se odmah, bez čekanja na grešku:
- Za dimenzije > 400 mm: upozorenje na max 2 decimale
- Za dimenzije > 600 mm: napomena o blizini maksimuma (715.295 mm)

**Sanitizacija lijepljenog teksta**
Zalijepljeni tekst koji nije ispravna dimenzija automatski se čisti. Ako nije moguće izvući broj, prikazuje se toast obavijest.

**Toast obavijesti**
Kratke obavijesti pri dnu ekrana koje nestaju automatski nakon ~2,5 sekunde. Koriste se za potvrdu kopiranja i upozorenja pri lijepljenju.

**Tipkovnički prečaci**

| Tipka | Akcija |
|---|---|
| `Enter` | Pokreni izračun |
| `Escape` | Zatvori info modal |
| Klik na pozadinu | Zatvori info modal |

**Brži algoritam za najbližu dimenziju**
Stari algoritam tražio je samo prema manjim vrijednostima iterativno po 0.001 mm. Novi pretražuje simultano prema gore i prema dolje s ranim izlaskom čim se pronađe rješenje.

---

#### 🎨 Poboljšanja sučelja

- Legenda boja (🟢 ≥10mm / 🟡 1.5–9.5mm / 🟣 1.01–1.49mm / 🩷 0.5–1.009mm) dodana uz grid pločica u info modalu
- Popis pločica u rezultatima prikazuje se `monospace` fontom radi lakšeg čitanja
- Vizualni blokovi pločica blago se podižu pri hoveru

---

#### 🔧 Meta i SEO

Dodani meta tagovi za bolje dijeljenje linka i prikaz na mobilnim uređajima:
```html
<meta name="description" content="Kalkulator paralelnih mjernih pločica...">
<meta property="og:title"       content="Kalkulator mjernih pločica / Gauge Block Calculator">
<meta property="og:description" content="Pronađite optimalnu kombinaciju...">
<meta name="theme-color"        content="#6366f1">
```

---

#### 📦 Bez breaking changes

- Skup pločica (87 komada) ostaje nepromijenjen
- Algoritam pretrage (DFS) ostaje nepromijenjen
- Sva tri jezika (HR, EN, DE) i dalje podržana
- Sve granice (maxDepth, maxIterations, maxResults) ostaju iste
- Aplikacija i dalje radi potpuno offline, bez vanjskih ovisnosti

---

### [1.2.0] – 2025

- Dodan njemački prijevod (DE)
- Responzivan dizajn za mobilne uređaje (≤ 480px)
- Skrivanje teksta na gumbima na malim ekranima
- Obojeni chipovi u info modalu

### [1.1.0] – 2025

- Tamna i svijetla tema
- Višejezičnost (HR, EN)
- Info modal s popisom dostupnih pločica

### [1.0.0] – 2025

- Početno izdanje
- DFS algoritam za pretragu kombinacija pločica
- Vizualni prikaz kombinacija s bojama po kategorijama veličine
- Podrška za unos s decimalnom točkom i zarezom

---

## 🇬🇧 English



---

### [2.0.0] – 2026

#### 🐛 Bug Fixes

**Floating-point precision**
JavaScript uses 64-bit floating-point numbers (IEEE 754), meaning operations like `0.1 + 0.2` don't produce exactly `0.3`, but rather `0.30000000000000004`. This could cause valid combinations to be missed or incorrect sums to be displayed.

Fix: all block values and the entered dimension are converted to integers by multiplying by `1000` (e.g. `1.005 mm` → `1005`). All arithmetic is performed with integers, and results are divided by `1000` only at display time.

```js
// v1.2 – potential floating-point error
const gaugeBlocks = [100, 90, ..., 1.005, ..., 0.5];

// v2.0 – exact, no rounding errors
const gaugeBlocks = gaugeBlocksRaw.map(b => Math.round(b * 1000));
const targetInt   = Math.round(target * 1000);
```

**Input validation edge cases**
Entering `0` or negative values no longer passes validation silently — a clear, specific error message is now shown.

---

#### ✨ New Features

**Theme and language persistence**
The selected theme (dark/light) and language (HR/EN/DE) are now saved between visits using `localStorage`. Settings no longer reset on page refresh.

**Recent search history**
The last 5 successful searches are displayed as clickable chips below the input field. Clicking a chip fills the field and triggers the calculation immediately — useful for repeated dimensions.

**Copy combination to clipboard**
Each result has a 📋 Copy button that saves the combination in a readable format, e.g.:
```
1.005 + 1.38 + 45.0 = 47.385 mm
```
A fallback is included for browsers that don't support the `navigator.clipboard` API.

**Clear input button (✕)**
Appears inside the field as soon as the user starts typing. Clicking it clears the content and returns focus — faster than manually selecting and deleting.

**Inline hint below the input field**
Short notes appear immediately, without waiting for an error:
- For dimensions > 400 mm: warning about the 2 decimal place limit
- For dimensions > 600 mm: note about approaching the maximum (715.295 mm)

**Paste sanitisation**
Pasted text that is not a valid dimension is automatically cleaned. If a number cannot be extracted, a toast notification is shown.

**Toast notifications**
Short notifications at the bottom of the screen that disappear automatically after ~2.5 seconds. Used for copy confirmation and paste warnings.

**Keyboard shortcuts**

| Key | Action |
|---|---|
| `Enter` | Run calculation |
| `Escape` | Close info modal |
| Click backdrop | Close info modal |

**Faster nearest-dimension algorithm**
The old algorithm searched only downward in 0.001 mm steps. The new one searches simultaneously upward and downward, with an early exit as soon as a solution is found in either direction.

---

#### 🎨 UI Improvements

- Colour legend (🟢 ≥10mm / 🟡 1.5–9.5mm / 🟣 1.01–1.49mm / 🩷 0.5–1.009mm) added alongside the block grid in the info modal
- Block list in results now uses `monospace` font for easier reading
- Visual block tiles lift slightly on hover

---

#### 🔧 Meta & SEO

Added meta tags for better link sharing and mobile display:
```html
<meta name="description" content="Gauge block calculator...">
<meta property="og:title"       content="Kalkulator mjernih pločica / Gauge Block Calculator">
<meta property="og:description" content="Find the optimal combination...">
<meta name="theme-color"        content="#6366f1">
```

---

#### 📦 No Breaking Changes

- Block set (87 pieces) unchanged
- Search algorithm (DFS) unchanged
- All three languages (HR, EN, DE) still supported
- All limits (maxDepth, maxIterations, maxResults) unchanged
- App still works fully offline with no external dependencies

---

### [1.2.0] – 2025

- Added German translation (DE)
- Responsive design for mobile devices (≤ 480px)
- Button text hidden on small screens
- Coloured chips in info modal

### [1.1.0] – 2025

- Dark and light theme
- Multilingual support (HR, EN)
- Info modal with available block list

### [1.0.0] – 2025

- Initial release
- DFS algorithm for block combination search
- Visual display of combinations with size-category colours
- Support for input with decimal point and comma

---

## 🇩🇪 Deutsch



---

### [2.0.0] – 2026

#### 🐛 Fehlerbehebungen

**Gleitkomma-Präzision**
JavaScript verwendet 64-Bit-Gleitkommazahlen (IEEE 754), weshalb Operationen wie `0.1 + 0.2` nicht exakt `0.3` ergeben, sondern `0.30000000000000004`. Dies konnte dazu führen, dass gültige Kombinationen übersehen oder falsche Summen angezeigt wurden.

Lösung: Alle Endmaß-Werte und die eingegebene Dimension werden durch Multiplikation mit `1000` in ganze Zahlen umgewandelt (z.B. `1,005 mm` → `1005`). Alle Berechnungen erfolgen mit ganzen Zahlen; die Ergebnisse werden erst bei der Anzeige durch `1000` dividiert.

```js
// v1.2 – möglicher Gleitkomma-Fehler
const gaugeBlocks = [100, 90, ..., 1.005, ..., 0.5];

// v2.0 – exakt, ohne Rundungsfehler
const gaugeBlocks = gaugeBlocksRaw.map(b => Math.round(b * 1000));
const targetInt   = Math.round(target * 1000);
```

**Eingabevalidierung: Grenzfälle**
Die Eingabe von `0` oder negativen Werten wird nicht mehr stillschweigend akzeptiert — es wird eine klare, spezifische Fehlermeldung angezeigt.

---

#### ✨ Neue Funktionen

**Speichern von Theme und Sprache**
Das gewählte Theme (dunkel/hell) und die Sprache (HR/EN/DE) werden nun zwischen Besuchen per `localStorage` gespeichert. Die Einstellungen werden bei Seitenaktualisierung nicht mehr zurückgesetzt.

**Verlauf der letzten Suchen**
Die letzten 5 erfolgreichen Suchen werden als anklickbare Chips unterhalb des Eingabefeldes angezeigt. Ein Klick auf einen Chip füllt das Feld aus und startet die Berechnung sofort — praktisch für wiederkehrende Maße.

**Kombination in Zwischenablage kopieren**
Jedes Ergebnis hat eine 📋 Kopieren-Schaltfläche, die die Kombination in lesbarer Form speichert, z.B.:
```
1.005 + 1.38 + 45.0 = 47.385 mm
```
Ein Fallback ist für Browser implementiert, die die `navigator.clipboard`-API nicht unterstützen.

**Eingabe-löschen-Schaltfläche (✕)**
Erscheint im Eingabefeld, sobald der Nutzer zu tippen beginnt. Ein Klick löscht den Inhalt und setzt den Fokus zurück — schneller als manuelles Markieren und Löschen.

**Inline-Hinweis unterhalb des Eingabefeldes**
Kurze Hinweise erscheinen sofort, ohne auf einen Fehler warten zu müssen:
- Bei Maßen > 400 mm: Warnung über das Limit von 2 Dezimalstellen
- Bei Maßen > 600 mm: Hinweis auf die Nähe zum Maximum (715,295 mm)

**Einfüge-Bereinigung**
Eingefügter Text, der kein gültiges Maß ist, wird automatisch bereinigt. Wenn keine Zahl extrahiert werden kann, wird eine Toast-Benachrichtigung angezeigt.

**Toast-Benachrichtigungen**
Kurze Benachrichtigungen am unteren Bildschirmrand, die nach ~2,5 Sekunden automatisch verschwinden. Werden für Kopierbestätigung und Einfüge-Warnungen verwendet.

**Tastaturkürzel**

| Taste | Aktion |
|---|---|
| `Enter` | Berechnung starten |
| `Escape` | Info-Modal schließen |
| Klick auf Hintergrund | Info-Modal schließen |

**Schnellerer Algorithmus für nächste Dimension**
Der alte Algorithmus suchte nur in 0,001-mm-Schritten nach unten. Der neue sucht gleichzeitig nach oben und unten und beendet die Suche, sobald in einer der beiden Richtungen eine Lösung gefunden wird.

---

#### 🎨 UI-Verbesserungen

- Farblegende (🟢 ≥10mm / 🟡 1.5–9.5mm / 🟣 1.01–1.49mm / 🩷 0.5–1.009mm) neben dem Endmaß-Raster im Info-Modal hinzugefügt
- Endmaß-Liste in Ergebnissen verwendet jetzt `monospace`-Schrift für bessere Lesbarkeit
- Visuelle Endmaß-Kacheln heben sich beim Hover leicht an

---

#### 🔧 Meta & SEO

Meta-Tags für besseres Link-Teilen und mobile Darstellung hinzugefügt:
```html
<meta name="description" content="Endmaß-Rechner...">
<meta property="og:title"       content="Kalkulator mjernih pločica / Gauge Block Calculator">
<meta property="og:description" content="Finden Sie die optimale Kombination...">
<meta name="theme-color"        content="#6366f1">
```

---

#### 📦 Keine Breaking Changes

- Endmaß-Satz (87 Stück) unverändert
- Suchalgorithmus (DFS) unverändert
- Alle drei Sprachen (HR, EN, DE) weiterhin unterstützt
- Alle Grenzen (maxDepth, maxIterations, maxResults) unverändert
- App funktioniert weiterhin vollständig offline ohne externe Abhängigkeiten

---

### [1.2.0] – 2025

- Deutsche Übersetzung hinzugefügt (DE)
- Responsives Design für mobile Geräte (≤ 480px)
- Schaltflächentext auf kleinen Bildschirmen ausgeblendet
- Farbige Chips im Info-Modal

### [1.1.0] – 2025

- Dunkles und helles Theme
- Mehrsprachige Unterstützung (HR, EN)
- Info-Modal mit Liste der verfügbaren Endmaße

### [1.0.0] – 2025

- Erstveröffentlichung
- DFS-Algorithmus für die Suche nach Endmaß-Kombinationen
- Visuelle Darstellung der Kombinationen mit größenkategoriebezogenen Farben
- Unterstützung für Eingabe mit Dezimalpunkt und Komma

---

## 👨‍💻 Autor / Author / Autor

**Josip Sinković**  
📧 motorola10@gmail.com

---

🇭🇷 *Program napravljen za kolege koji ne znaju računati napamet!* 😄  
🇬🇧 *Program created for colleagues who can't calculate in their heads!* 😄  
🇩🇪 *Programm erstellt für Kollegen, die nicht im Kopf rechnen können!* 😄
