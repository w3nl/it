// Service worker for Hello, IT: makes the game installable and playable offline.
// Bump CACHE when you change the game, so phones pick up the new version.
const CACHE = 'hello-it-v11';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './css/base.css',
  './css/chapter2.css',
  './css/chapter3.css',
  './css/phone.css',
  './css/chapter4.css',
  './css/chapter5.css',
  './css/chapter6.css',
  './css/animations.css',
  './js/boot.js',
  './js/i18n.js',
  './js/core.js',
  './js/chapter1.js',
  './js/items.js',
  './js/chapter2.js',
  './js/chapter3.js',
  './js/chapter4.js',
  './js/chapter5.js',
  './js/chapter6.js',
  './js/hints.js',
  './js/ambience.js',
  './lang/nl/ui.txt',
  './lang/nl/ch1.txt',
  './lang/nl/ch2.txt',
  './lang/nl/ch3.txt',
  './lang/nl/ch4.txt',
  './lang/nl/ch5.txt',
  './lang/nl/ch6.txt',
  './lang/nl/hints.txt',
  './lang/nl/scenes.txt',
  './js/app.js',
  './scenes/office.svg',
  './scenes/server.svg',
  './scenes/jen.svg',
  './scenes/doug.svg',
  './scenes/lift.svg',
  './scenes/dungeon.svg',
  './scenes/yacht.svg',
  './portraits/you.svg',
  './portraits/roy.svg',
  './portraits/moss.svg',
  './portraits/jen.svg',
  './portraits/douglas.svg',
  './portraits/douglas-captain.svg',
  './portraits/machine.svg',
  './portraits/duck.svg',
  './portraits/fax.svg',
  './portraits/dragon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // The game page: try the network first so updates arrive, fall back to the cached copy offline.
  if (req.mode === 'navigate') {
    event.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); return res; })
      .catch(() => caches.match('./index.html')));
    return;
  }

  // The game's own files (scripts, styles, scenes): network first, so updates arrive together; cache when offline.
  if (url.origin === location.origin) {
    event.respondWith(fetch(req).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
      .catch(() => caches.match(req)));
    return;
  }

  // Google Fonts: cache first, then fetch and keep a copy.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    })));
  }
});
