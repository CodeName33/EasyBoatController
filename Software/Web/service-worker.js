console.log("Service Worker for EBC started");
self.addEventListener('install', (event) => {
    console.log("Service Worker for EBC: install");
    //@ts-ignore
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
    //@ts-ignore
    event.respondWith(
      //@ts-ignore
        fetch(event.request).then((response) => {
          //@ts-ignore
            console.log("Service Worker for EBC: fetch.then: ", event.request);
            var responsec = response.clone()
            caches.open('static-v1').then((cache) => {
              //@ts-ignore
                cache.put(event.request, responsec);
            });
            return response;
        }).catch((e) => {
          //@ts-ignore
            console.log("Service Worker for EBC: fetch.catch: ", e, event.request);
            //@ts-ignore
            return caches.match(event.request);
        })
    );
  });

  self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    //@ts-ignore
    self.skipWaiting();
  }
});