// 離線快取：先用網路，失敗時用快取（內容更新時改版本號）
const CACHE = 'idolstudy-v82';
const FILES = ['./', './index.html', './css/style.css', './css/talk.css', './css/rewards.css', './css/lobby-pastel.css', './css/pastel-pages.css', './css/names.css', './css/v2.css', './css/drama.css', './js/names.js', './js/rewards.js', './js/app.js', './js/data.js', './js/store.js', './manifest.webmanifest', './icons/icon-192.png', './js/course.js', './js/util.js', './js/talk.js', './js/sound.js', './js/drama.js', './js/games.js', './js/course2.js', './js/course3.js', './js/themes.js', './js/extras.js', './js/bank.js', './js/examdata.js', './js/exam.js', './js/npc.js', './js/hangul.js', './js/hangul-art.js', './js/facemap.js', './js/avatar.js', './js/doll-index.js', './js/friends.js', './js/cloud.js', './js/chat.js', './js/chatcards.js', './js/binder.js', './js/eggs.js', './css/exam.css', './css/fx.css', './css/chat.css', './css/me.css', './css/binder.css', './css/home-stage.css', './css/hsing.css', './js/hsing.js', './assets/art/bg-practice.webp', './assets/art/teacher-cut.webp', './assets/art/teacher-face.webp', './assets/art/logo.webp', './assets/art/bn-closet.webp', './assets/art/bn-cards.webp', './assets/art/bn-friends.webp', './assets/art/bn-map.webp', ...['home','wrong','cards','me','mic','speaker','gift','fire','book','chat','star','heart','zh','en','ko','meme','medal','map','trophy'].map((n) => `./assets/art/icons/ui-${n}.webp`)];

self.addEventListener('install', (e) => {
  // cache:'reload'：不要拿瀏覽器 HTTP 快取（GitHub Pages 會快取 10 分鐘）裡的舊檔
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // 只快取自己網站的檔案和 Firebase 程式庫；登入、資料庫連線（googleapis 等）一律不經過這裡
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin && url.hostname !== 'www.gstatic.com') return;
  e.respondWith(
    // 自己網站的檔案一律跟伺服器確認是不是最新（沒改只回 304，很省流量），才不會更新後還看到舊版
    (url.origin !== self.location.origin ? fetch(e.request)
      : e.request.mode === 'navigate' ? fetch(url.href, { cache: 'no-cache', credentials: 'same-origin' })
      : fetch(new Request(e.request, { cache: 'no-cache' })))
      .then((res) => { if (res.status === 200) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {}); } return res; }) // 音樂分段下載（206）不能存
      .catch(() => caches.match(e.request)),
  );
});
