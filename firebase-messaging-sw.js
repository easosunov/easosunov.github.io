// firebase-messaging-sw.js - Root level for FCM
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

console.log('🔥 FCM Service Worker LOADED (ROOT)');

firebase.initializeApp({
    apiKey: "AIzaSyChU1sW6u5T0Ho0y0yIPgI1dHFYx-6Q_X8",
    authDomain: "webrtc-v0.firebaseapp.com",
    projectId: "webrtc-v0",
    storageBucket: "webrtc-v0.firebasestorage.app",
    messagingSenderId: "647705075894",
    appId: "1:647705075894:web:d23544a3f8e509f69e8617"
});

const messaging = firebase.messaging();

// Raw push listener for debugging
self.addEventListener('push', (event) => {
    console.log('🔥🔥🔥 RAW PUSH RECEIVED AT ROOT SW 🔥🔥🔥');
    
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {}
    
    const title = data.data?.title || data.notification?.title || 'Incoming Call';
    const options = {
        body: data.data?.body || data.notification?.body || 'You have an incoming call',
        icon: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        badge: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: data.data || data
    };
    
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// FCM background handler
messaging.onBackgroundMessage((payload) => {
    console.log('🔥🔥🔥 FCM BACKGROUND MESSAGE RECEIVED 🔥🔥🔥');
    console.log('Payload:', payload);
    
    const title = payload.notification?.title || payload.data?.title || 'Incoming Call';
    const options = {
        body: payload.notification?.body || payload.data?.body || 'You have an incoming call',
        icon: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        badge: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        vibrate: [200, 100, 200],
        requireInteraction: true,
        data: payload.data || {}
    };
    
    self.registration.showNotification(title, options);
});

// Install and activate handlers
self.addEventListener('install', (event) => {
    console.log('🔥 ROOT SW INSTALLED');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('🔥 ROOT SW ACTIVATED');
    event.waitUntil(clients.claim());
});