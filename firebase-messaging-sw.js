// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

console.log('🔥 FCM Service Worker LOADED');

firebase.initializeApp({
    apiKey: "AIzaSyChU1sW6u5T0Ho0y0yIPgI1dHFYx-6Q_X8",
    authDomain: "webrtc-v0.firebaseapp.com",
    projectId: "webrtc-v0",
    storageBucket: "webrtc-v0.firebasestorage.app",
    messagingSenderId: "647705075894",
    appId: "1:647705075894:web:d23544a3f8e509f69e8617"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('🔥 FCM Background message:', payload);
    
    const data = payload.data || {};
    const callId = data.callId;
    const callerId = data.callerId;
    const callerName = data.callerName || 'Someone';
    const title = data.title || '📞 Incoming Call';
    
    const options = {
        body: data.body || `Call from ${callerName}`,
        icon: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        badge: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        tag: 'incoming-call',
        renotify: true,
        timestamp: Date.now(),
        data: {
            callId: callId,
            callerId: callerId,
            callerName: callerName,
            url: 'https://easosunov.github.io/webrtc_v0/'
        },
        // ONLY ANSWER BUTTON
        actions: [
            { action: 'answer', title: 'Answer' }
        ]
    };
    
    self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked, action:', event.action);
    
    event.notification.close();
    
    const data = event.notification.data;
    const action = event.action;
    
    if (action === 'answer') {
        console.log('📞 ANSWER - Opening call screen');
        const url = `https://easosunov.github.io/webrtc_v0/?callId=${data.callId}&callerId=${data.callerId}&autoAnswer=true`;
        event.waitUntil(clients.openWindow(url));
    } else {
        console.log('Default click - Opening app');
        const url = data.url || 'https://easosunov.github.io/webrtc_v0/';
        event.waitUntil(clients.openWindow(url));
    }
});

self.addEventListener('install', (event) => {
    console.log('🔥 Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('🔥 Service Worker activating');
    event.waitUntil(self.clients.claim());
});
