console.log("Service Worker for EBC started");
self.addEventListener('install', (event) => {
    console.log("Service Worker for EBC: install");
    event.waitUntil(
      caches.open('static-v1').then((cache) => {
        return cache.addAll([
          './',
          './index.htm',
          './icon.png',
          './manifest.json'
        ]);
      })
    );
  });
  
  self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).then((response) => {
            console.log("Service Worker for EBC: fetch.then: ", event.request);
            var responsec = response.clone()
            caches.open('static-v1').then((cache) => {
                cache.put(event.request, responsec);
            });
            return response;
        }).catch((e) => {
            console.log("Service Worker for EBC: fetch.catch: ", e, event.request);
            return caches.match(event.request);
        })
    );
  });

  self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});