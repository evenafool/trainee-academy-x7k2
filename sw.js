// 離線快取：先用網路，失敗時用快取（內容更新時改版本號）
const CACHE = 'idolstudy-v25';
const FILES = ['./', './index.html', './css/style.css', './css/talk.css', './css/rewards.css', './css/lobby-pastel.css', './css/pastel-pages.css', './css/names.css', './css/v2.css', './css/drama.css', './js/names.js', './js/rewards.js', './js/app.js', './js/data.js', './js/store.js', './manifest.webmanifest', './icons/icon-192.png', './js/course.js', './js/util.js', './js/talk.js', './js/sound.js', './js/drama.js', './js/games.js', './js/course2.js', './js/course3.js', './js/themes.js', './js/extras.js', './js/bank.js', './js/examdata.js', './js/exam.js', './css/exam.css', './assets/art/bg-practice.webp', './assets/art/teacher-cut.webp', './assets/art/teacher-face.webp', ...['home','wrong','cards','me','mic','speaker','gift','fire','book','chat','star','heart','zh','en','ko','meme','medal','map','trophy'].map((n) => `./assets/art/icons/ui-${n}.webp`)];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request)),
  );
});
