/* QR Attendance System — Service Worker v5 */
const CACHE = 'qratt-v5';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','index.html','manifest.json']).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url=new URL(e.request.url);
  if(url.hostname.includes('google')||url.hostname.includes('firebase')||url.hostname.includes('gstatic')||url.hostname.includes('cloudflare')){
    e.respondWith(fetch(e.request).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}})));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached=>{
    if(cached)return cached;
    return fetch(e.request).then(res=>{if(res.ok&&e.request.method==='GET'){caches.open(CACHE).then(c=>c.put(e.request,res.clone()));}return res;}).catch(()=>caches.match('/index.html'));
  }));
});
