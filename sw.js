// Service worker — omogućuje rad kalkulatora bez internetske veze.
// Strategija je network-first: dok ima mreže, korisnik UVIJEK dobiva svježu verziju
// bez obzira na CACHE_NAME. Promjena imena keša služi samo čišćenju starih unosa
// (i tome da install ponovno povuče sve datoteke iz ASSETS) — bump ga pri svakom izdanju.
const CACHE_NAME = 'etaloni-v3.2';
const ASSETS = [
    './', './index.html', './solver.js', './manifest.json',
    './icon-192.png', './icon-512.png', './icon.svg'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;
    // samo vlastite datoteke; tuđe (npr. analytics, fontovi) ne keširamo
    if (new URL(req.url).origin !== self.location.origin) return;
    event.respondWith(
        fetch(req)
            .then(resp => {
                // Keširaj SAMO uspješne odgovore. 404/500 s poslužitelja ne smije
                // pregaziti ispravnu keširanu kopiju, inače offline dobiješ stranicu greške.
                if (resp && resp.ok && resp.type === 'basic') {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(req, clone)).catch(() => {});
                }
                return resp;
            })
            .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
    );
});
