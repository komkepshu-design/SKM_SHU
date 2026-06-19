// SKM RSU Surya Husadha — Service Worker
// v1775777973 — network-first agar selalu pakai versi terbaru
const CACHE_NAME = 'skm-rsu-v1775777973';

// Install: bersihkan semua cache lama
self.addEventListener('install', e => {
  self.skipWaiting(); // Aktifkan SW baru langsung tanpa tunggu tab ditutup
});

// Activate: hapus semua cache lama
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        console.log('[SW] Deleting old cache:', k);
        return caches.delete(k); // Hapus SEMUA cache lama
      }))
    ).then(() => self.clients.claim())
  );
});

// Fetch: NETWORK FIRST — selalu coba ambil dari server dulu
// Hanya pakai cache kalau offline
self.addEventListener('fetch', e => {
  // Skip non-GET dan cross-origin requests
  if(e.request.method !== 'GET') return;
  if(!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then(res => {
        // Kalau berhasil dari network, simpan ke cache (untuk offline)
        if(res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => {
        // Offline: coba dari cache
        return caches.match(e.request)
          .then(cached => cached || caches.match('./index.html'));
      })
  );
});
