// solver.js — algoritam kalkulatora mjernih pločica, izdvojen iz index.html.
// Čista logika bez DOM-a: radi u pregledniku (window.GaugeSolver) i u Nodeu (require).
// Testovi: node test.js
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.GaugeSolver = factory();
})(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ─── JEDINICE ───────────────────────────────────────────────────────────
    // scale = koliko cijelih jedinica ide u 1 mm / 1 inch (sve je integer aritmetika)
    // trim  = true -> prikaz reže suvišne nule (kataloška notacija: .1001, .05, 1)
    // t1/t2 = pragovi za broj prikazanih alternativa (fizičke konstante, NE relativne na max)
    const UNITS = {
        mm: { sym: 'mm', name: 'mm',   sfx: ' mm', scale: 1000,   maxDec: 3, trim: false, dec: 3,
              t1: 100000, t2: 200000, t1Label: '100 mm', t2Label: '200 mm',
              ex: ['47.385', '47,385'],
              cls: [10000, 1500, 1010],
              legend: ['≥ 10 mm', '1.5 – 9.99 mm', '1.01 – 1.49 mm', '≤ 1.009 mm'] },
        in: { sym: '"',  name: 'inch', sfx: '"',   scale: 100000, maxDec: 5, trim: true,  dec: 5,
              t1: 400000, t2: 800000, t1Label: '4"', t2Label: '8"',
              ex: ['0.4735', '0,4735'],
              cls: [100000, 15000, 10100],
              legend: ['≥ 1"', '0.15 – 0.95"', '0.101 – 0.149"', '≤ 0.1"'] }
    };

    // ─── SETOVI (jedan izvor istine; sastavi iz tablice dobavljača) ──────────
    // Metrički: jedinica 0.001 mm. Inčni (Mitutoyo serija 516): jedinica 0.00001".
    function range(from, to, step, scale) {
        const out = [];
        const n = Math.round((to - from) / step) + 1;
        for (let i = 0; i < n; i++) out.push(Math.round((from + i * step) * scale));
        return out;
    }
    const mmR = (a, b, s) => range(a, b, s, 1000);
    const inR = (a, b, s) => range(a, b, s, 100000);

    const SETS = {
        '32':  { unit: 'mm', pieces: 32,  blocks: [
            1005, ...mmR(1.01, 1.09, 0.01), ...mmR(1.1, 1.9, 0.1),
            ...mmR(1, 9, 1), ...mmR(10, 30, 10), 50000 ] },
        '47':  { unit: 'mm', pieces: 47,  blocks: [
            1005, ...mmR(1.00, 1.20, 0.01), ...mmR(1.3, 2.0, 0.1),
            ...mmR(3, 10, 1), ...mmR(20, 100, 10) ] },
        '87':  { unit: 'mm', pieces: 87,  blocks: [
            ...mmR(1.001, 1.009, 0.001), ...mmR(1.01, 1.49, 0.01),
            ...mmR(0.5, 9.5, 0.5), ...mmR(10, 100, 10) ] },
        '103': { unit: 'mm', pieces: 103, blocks: [
            1005, ...mmR(1.01, 1.49, 0.01),
            ...mmR(0.5, 24.5, 0.5), ...mmR(25, 100, 25) ] },

        // Mitutoyo 516-549/901-904 — Inch Block Set, 81 kom
        'i81': { unit: 'in', pieces: 81, blocks: [
            ...inR(0.1001, 0.1009, 0.0001), ...inR(0.101, 0.149, 0.001),
            ...inR(0.05, 0.95, 0.05), ...inR(1, 4, 1) ] },
        // Mitutoyo 516-550/913-916 — Inch Block Set, 35 kom (napomena: NEMA 3" pločice)
        'i35': { unit: 'in', pieces: 35, blocks: [
            10005, ...inR(0.1001, 0.1009, 0.0001), ...inR(0.101, 0.109, 0.001),
            ...inR(0.11, 0.19, 0.01), ...inR(0.1, 0.3, 0.1),
            50000, 100000, 200000, 400000 ] },
        // Mitutoyo 516-551/917-920 — Thin Block Set, 28 kom
        'i28': { unit: 'in', pieces: 28, blocks: [
            2005, ...inR(0.0201, 0.0209, 0.0001), ...inR(0.021, 0.029, 0.001),
            ...inR(0.01, 0.09, 0.01) ] },
        // Mitutoyo 516-926/927 — Thin Block Set, 10 kom
        'i10': { unit: 'in', pieces: 10, blocks: [ ...inR(0.005, 0.050, 0.005) ] }
    };

    const gcd2 = (a, b) => { while (b) { const t = a % b; a = b; b = t; } return a; };

    // sanity: sastav mora odgovarati deklariranom broju komada i biti bez duplikata
    const SET_ERRORS = [];
    for (const [id, s] of Object.entries(SETS)) {
        s.blocks.sort((a, b) => b - a);
        s.max = s.blocks.reduce((a, b) => a + b, 0);
        // gcd = fizička granularnost seta. Svaki zbroj podskupa je višekratnik gcd-a,
        // pa sve što nije -> dokazano nedostižno. Koristi se i za kompresiju DP prostora.
        s.gcd = s.blocks.reduce(gcd2, 0);
        const uniq = new Set(s.blocks).size;
        if (s.blocks.length !== s.pieces || uniq !== s.pieces) {
            SET_ERRORS.push('SET ' + id + ': očekivano ' + s.pieces + ' kom, dobiveno ' +
                            s.blocks.length + ' (unikatnih ' + uniq + ')');
        }
    }
    if (SET_ERRORS.length && typeof console !== 'undefined') SET_ERRORS.forEach(e => console.error(e));

    // ─── 1. Brzi generički: eliminacija decimalnih mjesta. Null NE znači nemoguće. ──
    function solveFast(targetInt, blocks) {
        const avail = new Set(blocks);
        let rem = targetInt;
        const combo = [];
        const take = b => { combo.push(b); avail.delete(b); rem -= b; };
        const find = (mod, residue) => {
            let best = null;
            for (const b of avail) if (b <= rem && b % mod === residue && (best === null || b < best)) best = b;
            return best;
        };
        for (const mod of [10, 100, 1000]) {
            const r = rem % mod;
            if (r === 0) continue;
            let b = find(mod, r);
            if (b === null && mod === 1000) {
                const alt = r >= 500 ? r - 500 : r + 500;
                const b1 = alt === 0 ? find(1000, 500) : find(1000, alt);
                if (b1 !== null) { take(b1); b = find(1000, rem % 1000); }
            }
            if (b === null) return null;
            take(b);
        }
        const u = rem % 10000;
        if (u !== 0) {
            const b = find(10000, u);
            if (b === null) return null;
            take(b);
        }
        while (rem > 0) {
            let best = null;
            for (const b of avail) if (b <= rem && b % 10000 === 0 && (best === null || b > best)) best = b;
            if (best === null) return null;
            take(best);
        }
        return combo.sort((a, b) => b - a);
    }

    // ─── 2. DP subset-sum: egzaktna garancija dostižnosti + najbliže gore/dolje. ──
    //    0/1 (silazno po j) => svaka pločica najviše jednom; parent postavljen samo
    //    pri prvom dosezanju => lanac indeksa strogo pada => valjan podskup.
    //    KOMPRESIJA: svi blokovi su višekratnici g = gcd(blokovi), pa se DP vrti u
    //    g-prostoru. Za inčni 81-set to je limit 2.652.950 -> 265.295 (10x manje RAM-a).
    //
    //    Tablica ovisi SAMO o skupu dostupnih pločica, pa se gradi jednom (buildDP)
    //    i zatim se upiti (queryDP) rješavaju u O(1) + rekonstrukcija.
    function buildDP(blocks) {
        const bl = [...blocks];
        if (!bl.length) return {
            blocks: bl, g: 0, bs: [], limit: 0,
            reach: new Uint8Array(1), parent: new Int16Array(1), minCount: new Uint8Array(1)
        };
        const g = bl.reduce(gcd2, 0);
        const bs = bl.map(b => b / g);
        const limit = bs.reduce((a, b) => a + b, 0);
        const reach = new Uint8Array(limit + 1);
        const parent = new Int16Array(limit + 1).fill(-1);
        // 255 = nedostižno. Uz najviše 103 pločice Uint8 je dovoljan.
        // Ova tablica daje EGZAKTAN najmanji broj pločica za svaki dostižan zbroj.
        const minCount = new Uint8Array(limit + 1).fill(255);
        reach[0] = 1;
        minCount[0] = 0;
        const order = bs.map((b, i) => i).sort((x, y) => bs[y] - bs[x]);
        for (const i of order) {
            const b = bs[i];
            for (let j = limit; j >= b; j--) {
                if (!reach[j] && reach[j - b]) { reach[j] = 1; parent[j] = i; }
                if (minCount[j - b] !== 255) {
                    const candidate = minCount[j - b] + 1;
                    if (candidate < minCount[j]) minCount[j] = candidate;
                }
            }
        }
        return { blocks: bl, g, bs, limit, reach, parent, minCount };
    }

    function queryDP(dp, targetInt) {
        if (!dp.g) return { combo: null, lower: null, upper: null, reachable: false };
        const { blocks, g, bs, limit, reach, parent, minCount } = dp;
        const tg = targetInt / g;
        let combo = null;
        if (Number.isInteger(tg) && tg >= 0 && tg <= limit && reach[tg]) {
            combo = [];
            let j = tg;
            while (j > 0) { const i = parent[j]; combo.push(blocks[i]); j -= bs[i]; }
            combo.sort((a, b) => b - a);
        }
        let lower = null, upper = null;
        if (!combo) {
            for (let j = Math.min(Math.floor(tg), limit); j >= 1; j--) if (reach[j]) { lower = j * g; break; }
            for (let j = Math.max(Math.ceil(tg), 1); j <= limit; j++)  if (reach[j]) { upper = j * g; break; }
        }
        const minBlocks = combo && minCount ? minCount[tg] : (combo ? combo.length : null);
        return { combo, lower, upper, reachable: combo !== null, minBlocks };
    }

    // Kompatibilni omotač (gradi tablicu za svaki poziv — koristi buildDP/queryDP gdje je moguće)
    function solveDP(targetInt, blocks) {
        return queryDP(buildDP(blocks), targetInt);
    }

    // ─── 3. Enumeracija praktičnih kombinacija ───────────────────────────
    // Pretražuje se po TOČNOM broju pločica: prvo minLength, zatim minLength + 1...
    // Time limit rezultata više ne može napuniti duboka DFS grana prije nego što se
    // pregledaju kraće i praktičnije kombinacije.
    function enumerateByLength(targetInt, blocksDesc, minLength, maxLength, maxResults, maxIterations) {
        const blocks = [...blocksDesc].sort((a, b) => b - a);
        const n = blocks.length;
        const prefix = new Float64Array(n + 1);
        for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + blocks[i];

        const results = [];
        const combo = [];
        let iterations = 0;
        let iterationLimitReached = false;
        // Jedan rezultat više od limita dovoljan je da pouzdano znamo da je popis skraćen.
        const searchLimit = maxResults + 1;

        const maxPossible = (start, count) => prefix[start + count] - prefix[start];
        const minPossible = count => prefix[n] - prefix[n - count];

        function dfs(remaining, start, slots) {
            if (results.length >= searchLimit || iterationLimitReached) return;
            if (++iterations > maxIterations) { iterationLimitReached = true; return; }
            if (slots === 0) {
                if (remaining === 0) results.push(combo.slice());
                return;
            }
            if (n - start < slots) return;
            if (remaining > maxPossible(start, slots) || remaining < minPossible(slots)) return;

            if (slots === 1) {
                for (let i = start; i < n; i++) {
                    if (++iterations > maxIterations) { iterationLimitReached = true; return; }
                    const block = blocks[i];
                    if (block > remaining) continue;
                    if (block < remaining) return;
                    results.push(combo.concat(block));
                    return;
                }
                return;
            }

            const lastStart = n - slots;
            for (let i = start; i <= lastStart; i++) {
                if (results.length >= searchLimit || iterationLimitReached) return;
                const block = blocks[i];
                if (block > remaining) continue;
                const nextRemaining = remaining - block;
                const nextSlots = slots - 1;
                if (nextRemaining > maxPossible(i + 1, nextSlots)) continue;
                if (nextRemaining < minPossible(nextSlots)) continue;
                combo.push(block);
                dfs(nextRemaining, i + 1, nextSlots);
                combo.pop();
            }
        }

        const firstLength = Math.max(0, minLength);
        const lastLength = Math.min(maxLength, n);
        for (let length = firstLength; length <= lastLength; length++) {
            dfs(targetInt, 0, length);
            if (results.length >= searchLimit || iterationLimitReached) break;
        }

        return {
            combos: results.slice(0, maxResults),
            complete: !iterationLimitReached && results.length <= maxResults,
            truncated: iterationLimitReached || results.length > maxResults,
            iterations
        };
    }

    // Kompatibilni javni omotač: vraća do maxResults najkraćih kombinacija.
    function findAlternatives(targetInt, blocksDesc, maxResults, maxIterations, maxDepth) {
        return enumerateByLength(
            targetInt, blocksDesc, 0, maxDepth,
            maxResults, maxIterations
        ).combos;
    }

    // ─── GLAVNI ULAZ ────────────────────────────────────────────────────────
    // opts: { t1, t2 } pragovi jedinice, dp = predizgrađena tablica (opcionalno),
    //       extraLen = koliko pločica više od najkraće kombinacije još prikazati (default 1)
    function solve(targetInt, blocks, opts) {
        opts = opts || {};
        const t1 = opts.t1 !== undefined ? opts.t1 : UNITS.mm.t1;
        const t2 = opts.t2 !== undefined ? opts.t2 : UNITS.mm.t2;
        const extraLen = opts.extraLen !== undefined ? opts.extraLen : 1;
        const dp = opts.dp || buildDP(blocks);

        const blocksDesc = [...blocks].sort((a, b) => b - a);

        // Rani izlaz: nije višekratnik granularnosti seta -> dokazano nedostižno.
        if (dp.g && targetInt % dp.g !== 0) {
            const q = queryDP(dp, targetInt);
            return { combos: [], lower: q.lower, upper: q.upper };
        }

        // DP je jeftin (tablica već postoji) i egzaktan -> uvijek prvi.
        const q = queryDP(dp, targetInt);
        if (!q.combo) return { combos: [], lower: q.lower, upper: q.upper };
        const minLen = q.minBlocks;
        let maxResults, maxLen, maxIterations;
        if (targetInt <= t1) {
            maxResults = 100;
            maxLen = minLen + extraLen;
            maxIterations = 2000000;
        } else if (targetInt <= t2) {
            maxResults = 5;
            maxLen = minLen + extraLen;
            maxIterations = 2000000;
        } else {
            maxResults = 1;
            maxLen = minLen;
            maxIterations = 5000000;
        }

        const found = enumerateByLength(
            targetInt, blocksDesc, minLen, maxLen,
            maxResults, maxIterations
        );

        // DP jamči da rješenje postoji. Ovaj fallback čuva tu garanciju i u krajnje
        // nepovoljnom slučaju kada sigurnosni limit enumeracije istekne prije prvog nalaza.
        if (!found.combos.length) {
            found.combos = [q.combo];
            found.complete = false;
            found.truncated = true;
        }

        return {
            combos: found.combos,
            lower: null,
            upper: null,
            minLength: minLen,
            maxLength: maxLen,
            complete: found.complete,
            truncated: found.truncated,
            resultLimit: maxResults
        };
    }

    return {
        UNITS, SETS, SET_ERRORS, gcd2, range, solveFast, buildDP, queryDP, solveDP,
        enumerateByLength, findAlternatives, solve
    };
});
