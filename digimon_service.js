if location.pathname.includes("/wizardmon-needs-food-client") {
  this.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('v1').then(function(cache) {
        return cache.addAll([
          '/wizardmon-needs-food-client/assets/bundle.js',
          '/wizardmon-needs-food-client/assets/workers/hunger_worker.js',
          '/wizardmon-needs-food-client/assets/images/wizardmon.gif',
          '/wizardmon-needs-food-client/index.html',
          '/wizardmon-needs-food-client/'
        ]);
      })
    );
  });
} else {
  this.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open('v1').then(function(cache) {
        return cache.addAll([
          '/assets/bundle.js',
          '/assets/workers/hunger_worker.js',
          '/assets/images/wizardmon.gif',
          '/index.html',
          '/'
        ]);
      })
    );
  });
}

if location.pathname.includes("/wizardmon-needs-food-client") {
  this.addEventListener("fetch", function(event) {
    console.log('WORKER: fetch event in progress.');
    if (event.request.method !== 'GET') {
      console.log('WORKER: fetch event ignored.', event.request.method, event.request.url);
      return;
    }
    event.respondWith(
      caches
        .match(event.request)
        .then(function(cached) {
          var networked = fetch(event.request)
            .then(fetchedFromNetwork, unableToResolve)
            .catch(unableToResolve);
          console.log('WORKER: fetch event', cached ? '(cached)' : '(network)', event.request.url);
          return cached || networked;

          function fetchedFromNetwork(response) {
            var cacheCopy = response.clone();

            console.log('WORKER: fetch response from network.', event.request.url);

            caches
              .open(version + 'pages')
              .then(function add(cache) {
                cache.put(event.request, cacheCopy);
              })
              .then(function() {
                console.log('WORKER: fetch response stored in cache.', event.request.url);
              });
            return response;
          }
          function unableToResolve () {

            console.log('WORKER: fetch request failed in both cache and network.');

            return new Response('<h1>Service Unavailable</h1>', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/html'
              })
            });
          }
        })
    );
  });
};
