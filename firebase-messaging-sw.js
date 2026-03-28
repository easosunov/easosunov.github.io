// firebase-messaging-sw.js (ROOT ONLY: /firebase-messaging-sw.js)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyChU1sW6u5T0Ho0y0yIPgI1dHFYx-6Q_X8",
    authDomain: "webrtc-v0.firebaseapp.com",
    projectId: "webrtc-v0",
    storageBucket: "webrtc-v0.firebasestorage.app",
    messagingSenderId: "647705075894",
    appId: "1:647705075894:web:d23544a3f8e509f69e8617"
});

const messaging = firebase.messaging();

// 🔥 Handle FCM background messages - NO event.waitUntil!
messaging.onBackgroundMessage((payload) => {
    console.log('🔥 FCM Background message:', payload);

    const title =
        payload.notification?.title ||
        payload.data?.title ||
        '📞 Incoming Call';

    const options = {
        body:
            payload.notification?.body ||
            payload.data?.body ||
            'You have an incoming call',
        icon: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        badge: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: 'incoming-call',
        renotify: true,
        data: payload.data || {},
        actions: [
            { action: 'answer', title: 'Answer' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };

    // ✅ NO event.waitUntil here
    self.registration.showNotification(title, options);
});

// 🔥 RAW push fallback (for debugging + reliability)
self.addEventListener('push', (event) => {
    console.log('🔥 RAW PUSH EVENT');

    if (!event.data) return;

    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        console.error('Push parse error:', e);
    }

    // Prevent duplicate notifications if FCM already handled it
    if (data?.notification) return;

    self.registration.showNotification(
        data.title || 'Incoming Call',
        {
            body: data.body || 'New notification',
            icon: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
            data: data
        }
    );
});

// 🔥 Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || '/webrtc_v0/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if (client.url.includes('/webrtc_v0/') && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow(url);
            })
    );
});

// 🔥 Ensure SW activates immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
