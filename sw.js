// Cache para abrir sem internet. Para forçar atualização nos aparelhos, troque o número da versão.
var V = "taf-v1";
var SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", function (e) { e.waitUntil(caches.open(V).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== V; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var r = e.request; if (r.method !== "GET") return;
  var u = new URL(r.url);
  if (r.mode === "navigate") {
    e.respondWith(fetch(r).then(function (res) { var cp = res.clone(); caches.open(V).then(function (c) { c.put("index.html", cp); }); return res; }).catch(function () { return caches.match("index.html"); }));
    return;
  }
  if (u.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {
    e.respondWith(caches.match(r).then(function (hit) {
      var net = fetch(r).then(function (res) { if (res && (res.ok || res.type === "opaque")) { var cp = res.clone(); caches.open(V).then(function (c) { c.put(r, cp); }); } return res; }).catch(function () { return hit; });
      return hit || net;
    }));
  }
});
