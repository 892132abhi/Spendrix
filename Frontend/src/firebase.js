import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAxOEgpDadidoPy5kCbi39fe3sUDiG4aSk",
  authDomain: "spendrix-4f6e7.firebaseapp.com",
  projectId: "spendrix-4f6e7",
  storageBucket: "spendrix-4f6e7.firebasestorage.app",
  messagingSenderId: "858515138739",
  appId: "1:858515138739:web:ae21b786f4998d917e28c6",
  measurementId: "G-TTE68FD3YX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request user permission and retrieve the FCM Token
export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const token = await getToken(messaging, { 
        // Replace this string with the actual VAPID key from Firebase console
        vapidKey: 'BPPnGd_mPw8dQTT3VxDu15pGJgnVXamfBmGPHJZ8X6ipwpn4WJ3_k_aYGf1d6paBRtDli7Llk6sVBPOy3CpTJKE' 
      });
      if (token) {
        console.log('FCM Token generated successfully:', token);
        // Next step: Send this token to your backend API to save it
        return token;
      } else {
        console.log('No registration token available.');
      }
    } else {
      console.log('Notification permission denied.');
    }
  } catch (error) {
    console.error('Error fetching FCM token:', error);
  }
};

// Foreground listener: Captures incoming pushes while the user is actively viewing your app
export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });