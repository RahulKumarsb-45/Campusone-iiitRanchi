// CampusOne Clean Service Worker Handler
// Safely self-unregisters to clear any stale workers from localhost or previous builds without 404 errors

self.addEventListener("install", () => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.matchAll({ type: "window" }))
      .then((clients) => {
        // No-op: allowed to complete lifecycle cleanly
      })
  )
})
