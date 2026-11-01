const C='mycal-v6';self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.json','icon-192.png','icon-512.png'])))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!=C&&x!='mycal-data').map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!='GET')return;e.respondWith(fetch(e.request).then(r=>{const k=r.clone();caches.open(C).then(c=>c.put(e.request,k));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true})))});
const loc=d=>{const z=new Date(d);z.setMinutes(z.getMinutes()-z.getTimezoneOffset());return z.toISOString().slice(0,10)};
async function check(){const c=await caches.open('mycal-data');const r=await c.match('state.json');if(!r)return;const it=await r.json(),t=loc(new Date());
const due=it.filter(i=>i.date<=t),late=due.filter(i=>(i.end&&i.end>i.date?i.end:i.date)<t);const n=due.length;
if(self.navigator&&'setAppBadge' in self.navigator){try{n?await self.navigator.setAppBadge(n):await self.navigator.clearAppBadge()}catch(x){}}
const nr=await c.match('notified'),last=nr?await nr.text():'';
if(late.length&&last!=t&&self.Notification&&Notification.permission=='granted'){await self.registration.showNotification('My Calendar: '+late.length+' overdue',{body:late.slice(0,3).map(i=>(i.p?i.p+': ':'')+i.name).join(', '),tag:'daily',icon:'icon-192.png',badge:'icon-192.png',data:{url:'./#ban'}});await c.put('notified',new Response(t))}}
self.addEventListener('periodicsync',e=>{if(e.tag=='mycal-daily')e.waitUntil(check())});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{const w=l[0];if(w){w.postMessage('ban');return w.focus()}return clients.openWindow('./#ban')}))});
