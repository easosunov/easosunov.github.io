// firebase-messaging-sw.js
// Root service worker for FCM notifications
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

console.log('🔥 FCM Service Worker LOADED');

// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyChU1sW6u5T0Ho0y0yIPgI1dHFYx-6Q_X8",
    authDomain: "webrtc-v0.firebaseapp.com",
    projectId: "webrtc-v0",
    storageBucket: "webrtc-v0.firebasestorage.app",
    messagingSenderId: "647705075894",
    appId: "1:647705075894:web:d23544a3f8e509f69e8617"
});

const messaging = firebase.messaging();

// ==================== FOREGROUND MESSAGES ====================
// These are handled by the page via onMessage()
// This handler is for when the app is in the background

messaging.onBackgroundMessage((payload) => {
    console.log('🔥 FCM Background message received:', payload);
    
    // Extract data from payload (data-only format)
    const data = payload.data || {};
    const notification = payload.notification || {};
    
    const callId = data.callId;
    const callerId = data.callerId;
    const callerName = data.callerName || notification.body?.replace('Call from ', '') || 'Someone';
    const title = data.title || notification.title || '📞 Incoming Call';
    
    const options = {
        body: data.body || notification.body || `Call from ${callerName}`,
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
        actions: [
            { action: 'answer', title: 'Answer Call' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    };
    
    self.registration.showNotification(title, options);
});

// ==================== RAW PUSH HANDLER (Fallback) ====================
self.addEventListener('push', (event) => {
    console.log('🔥 RAW PUSH EVENT');
    
    if (!event.data) return;
    
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        console.error('Push parse error:', e);
    }
    
    // Prevent duplicate if FCM already handled it
    if (data.notification || data.data) return;
    
    self.registration.showNotification(data.title || 'Incoming Call', {
        body: data.body || 'You have an incoming call',
        icon: 'https://easosunov.github.io/webrtc_v0/favicon.ico',
        data: data
    });
});

// ==================== NOTIFICATION CLICK HANDLER ====================
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    console.log('Action:', event.action);
    console.log('Data:', event.notification.data);
    
    event.notification.close();
    
    const data = event.notification.data;
    const action = event.action;
    
    // Handle Answer action
    if (action === 'answer') {
        console.log('📞 Answering call');
        
        // Build URL with call parameters for auto-answer
        const url = `https://easosunov.github.io/webrtc_v0/?callId=${data.callId}&callerId=${data.callerId}&autoAnswer=true`;
        
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((clientList) => {
                    // Try to focus existing window/tab
                    for (const client of clientList) {
                        if (client.url.includes('/webrtc_v0/') && 'focus' in client) {
                            client.navigate(url);
                            return client.focus();
                        }
                    }
                    // Open new window/tab
                    return clients.openWindow(url);
                })
        );
    } 
    // Handle Dismiss action
    else if (action === 'dismiss') {
        console.log('❌ Call dismissed');
        // Optionally, you could send a fetch to reject the call
        // This requires a Cloud Function endpoint
        // fetch(`https://us-central1-webrtc-v0.cloudfunctions.net/rejectCall?callId=${data.callId}`)
        //     .catch(err => console.log('Dismiss request failed:', err));
    }
    // Default click (anywhere on notification)
    else {
        console.log('🔔 Default click');
        const url = data.url || 'https://easosunov.github.io/webrtc_v0/';
        event.waitUntil(clients.openWindow(url));
    }
});

// ==================== SERVICE WORKER LIFECYCLE ====================
self.addEventListener('install', (event) => {
    console.log('🔥 Service Worker installing');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('🔥 Service Worker activating');
    event.waitUntil(self.clients.claim());
});
