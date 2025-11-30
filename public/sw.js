// Service Worker for Guna Simulator PWA
// MUDANÇA IMPORTANTE: Sempre que fizeres grandes updates, muda este nome (v2, v3...)
const CACHE_NAME = 'guna-simulator-v2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  self.skipWaiting(); // Força o SW a ativar-se logo
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - Limpa caches antigas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('A apagar cache antiga:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Controla a página imediatamente
});

// Fetch event - Estratégia Híbrida Inteligente
self.addEventListener('fetch', event => {
  // Ignora pedidos que não sejam da nossa origem (ex: Google Fonts, APIs)
  if (!event.request.url.startsWith(self.location.origin)) return;

  // ESTRATÉGIA 1: Para HTML (Navegação) -> Network First (Tenta net, se falhar usa cache)
  // Isto garante que o utilizador vê sempre a versão mais recente do site
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Se a net funcionar, atualiza a cache com o novo HTML
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          return response;
        })
        .catch(() => {
          // Se estiver offline, mostra o que tem na cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // ESTRATÉGIA 2: Para Imagens, CSS, JS -> Cache First (Mais rápido)
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(networkResponse => {
        // Se não tiver na cache e sacar da net, guarda para a próxima
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        return networkResponse;
      });
    })
  );
});