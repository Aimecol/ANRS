/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Service Worker for Offline Functionality
 */

const CACHE_NAME = "balanced-diet-cache-v1";
const urlsToCache = [
  "/",
  "/home.html",
  "/index.html",
  "/budget.html",
  "/children.html",
  "/dashboard.html",
  "/css/style.css",
  "/js/main.js",
  "/js/auth.js",
  "/js/diet-analysis.js",
  "/js/budget-recommendations.js",
  "/js/children-recommendations.js",
  "/js/dashboard.js",
  "/data/rwanda-foods.json",
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response;
      }

      // Clone the request
      const fetchRequest = event.request.clone();

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Open cache and store response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If fetch fails, try to return a fallback page
          if (event.request.url.indexOf(".html") > -1) {
            return caches.match("/index.html");
          }
        });
    })
  );
});
