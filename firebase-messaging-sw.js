// firebase-messaging-sw.js (root)
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

// Keep track of active call notifications to avoid stacking
let activeCallId = null;

messaging.onBackgroundMessage((payload) => {
    console.log('🔥 FCM Background message:', payload);
    
    const callId = payload.data?.callId;
    const title = payload.data?.title || '📞 Incoming Call';
    const options = {
        body: payload.data?.body || 'You have an incoming call',
        icon: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        badge: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: 'incoming-call',  // Same tag replaces previous notification
        renotify: true,        // Still shows new one
        timestamp: Date.now(),
        data: payload.data || {},
        actions: [
            { action: 'answer', title: 'Answer' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    
    self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    const data = event.notification.data;
    const action = event.action;
    
    if (action === 'answer') {
        const url = data.url || `/webrtc_v0/?callId=${data.callId}&callerId=${data.callerId}`;
        event.waitUntil(clients.openWindow(url));
    }
});

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
