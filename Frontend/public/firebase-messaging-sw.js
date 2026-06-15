// Import scripts inside the service worker environment
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAxOEgpDadidoPy5kCbi39fe3sUDiG4aSk",
  authDomain: "spendrix-4f6e7.firebaseapp.com",
  projectId: "spendrix-4f6e7",
  storageBucket: "spendrix-4f6e7.firebasestorage.app",
  messagingSenderId: "858515138739",
  appId: "1:858515138739:web:ae21b786f4998d917e28c6",
  measurementId: "G-TTE68FD3YX"
};

// Initialize Firebase in the service worker background
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Background push notification event listener
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg' // Uses the icon you have defined in your index.html
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});