/* CNC Handbook: offline cache of reference material and calculators. */
const CACHE = 'cnc-handbook-v0.5.0';
const ASSETS = ['./','./index.html','./styles.css','./data.js','./manuals.js','./knowledge.js','./process-core.js','./process-holes.js','./process-cutting.js','./process-diagnostics.js','./deep-dive.js','./app.js','./manifest.webmanifest','./favicon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('cnc-handbook-')&&key!==CACHE).map(key=>caches.delete(key)))));self.clients.claim();});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request)).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>event.request.mode==='navigate'?caches.open(CACHE).then(cache=>cache.match('./index.html')):Response.error())));});

