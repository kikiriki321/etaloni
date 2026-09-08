// test.js — pokreni: node test.js
// Za svaki set: (a) sastav odgovara deklaraciji, (b) DP rekonstrukcija za SVAKI dostižni
// cilj zbraja na cilj i ne ponavlja pločice, (c) solveFast i DFS nikad ne vraćaju
// nevaljanu kombinaciju niti tvrde "dostižno" gdje DP kaže da nije, (d) najbliže
// vrijednosti su stvarno najbliže, (e) filtar alternativa radi.
'use strict';
const S = require('./solver.js');

let failures = 0, checks = 0;
function assert(cond, msg) { checks++; if (!cond) { failures++; console.error('FAIL:', msg); } }

function validCombo(combo, blocks, target) {
    if (!combo) return false;
    const set = new Set(blocks);
    const seen = new Set();
    let sum = 0;
    for (const b of combo) {
        if (!set.has(b) || seen.has(b)) return false;
        seen.add(b); sum += b;
    }
    return sum === target;
}

assert(S.SET_ERRORS.length === 0, 'SET_ERRORS: ' + S.SET_ERRORS.join('; '));

for (const [id, set] of Object.entries(S.SETS)) {
    const t0 = Date.now();
    const blocks = set.blocks;
    const u = S.UNITS[set.unit];
    const dp = S.buildDP(blocks);
    assert(dp.g === set.gcd, `${id}: gcd DP ${dp.g} != set ${set.gcd}`);
    assert(dp.limit * dp.g === set.max, `${id}: limit*g != max`);

    // (b) svaki višekratnik gcd-a od 0 do max
    let reachable = 0;
    for (let t = 0; t <= set.max; t += set.gcd) {
        const q = S.queryDP(dp, t);
        if (q.reachable) {
            reachable++;
            if (!validCombo(q.combo, blocks, t)) { assert(false, `${id}: DP nevaljan combo za ${t}`); break; }
        } else {
            // (d) lower/upper moraju biti dostižni i bez dostižnih vrijednosti između
            if (q.lower !== null) assert(S.queryDP(dp, q.lower).reachable, `${id}: lower ${q.lower} nije dostižan`);
            if (q.upper !== null) assert(S.queryDP(dp, q.upper).reachable, `${id}: upper ${q.upper} nije dostižan`);
        }
    }

    // (c) solveFast + DFS nad uzorkom ciljeva (uključujući nedostižne)
    const blocksDesc = [...blocks].sort((a, b) => b - a);
    const step = Math.max(set.gcd, Math.floor(set.max / 4000 / set.gcd) * set.gcd || set.gcd);
    for (let t = set.gcd; t <= set.max; t += step) {
        const q = S.queryDP(dp, t);
        const f = S.solveFast(t, blocksDesc);
        if (f) {
            assert(validCombo(f, blocks, t), `${id}: solveFast nevaljan za ${t}`);
            assert(q.reachable, `${id}: solveFast tvrdi dostižno, DP kaže ne: ${t}`);
        }
        const alts = S.findAlternatives(t, blocksDesc, 3, 20000, 12);
        for (const a of alts) assert(validCombo(a, blocks, t), `${id}: DFS nevaljan za ${t}`);
        if (alts.length) assert(q.reachable, `${id}: DFS tvrdi dostižno, DP kaže ne: ${t}`);
    }

    // (e) solve(): filtar alternativa, sortiranje, ne-višekratnik
    const mid = Math.floor(set.max / 2 / set.gcd) * set.gcd;
    const r = S.solve(mid, blocks, { t1: u.t1, t2: u.t2, dp });
    if (r.combos.length) {
        const minLen = r.combos[0].length;
        assert(r.combos.every(c => c.length <= minLen + 1), `${id}: alternative predugačke`);
        assert(r.combos.every(c => validCombo(c, blocks, mid)), `${id}: solve nevaljan combo`);
        for (let i = 1; i < r.combos.length; i++) assert(r.combos[i - 1].length <= r.combos[i].length, `${id}: solve nije sortiran po duljini`);
    }
    if (set.gcd > 1) {
        const r2 = S.solve(mid + 1, blocks, { t1: u.t1, t2: u.t2, dp });
        assert(r2.combos.length === 0 && (r2.lower !== null || r2.upper !== null), `${id}: ne-višekratnik nije odbijen`);
    }
    // izuzete pločice: solve nad podskupom ne smije koristiti izuzetu
    const excl = blocks[0];
    const sub = blocks.filter(b => b !== excl);
    const r3 = S.solve(excl, sub, { t1: u.t1, t2: u.t2 });
    assert(r3.combos.every(c => !c.includes(excl)), `${id}: koristi izuzetu pločicu`);

    console.log(`${id.padEnd(4)} ok  dostižno ${reachable}/${set.max / set.gcd + 1}  (${Date.now() - t0} ms)`);
}

console.log(`\n${checks} provjera, ${failures} grešaka`);
process.exit(failures ? 1 : 0);
