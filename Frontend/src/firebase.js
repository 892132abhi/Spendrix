
imp
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api/instance";

const firebaseConfig = {
  apiKey: "AIzaSyAxOEgpDadidoPy5kCbi39fe3sUDiG4aSk",
  authDomain: "spendrix-4f6e7.firebaseapp.com",
  projectId: "spendrix-4f6e7",
  storageBucket: "spendrix-4f6e7.firebasestorage.app",
  messagingSenderId: "858515138739",
  appId: "1:858515138739:web:ae21b786f4998d917e28c6",
  measurementId: "G-TTE68FD3YX"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("Notification permission denied");
      return null;
    }

    const token = await getToken(messaging, {
      vapidKey:
        "BPPnGd_mPw8dQTT3VxDu15pGJgnVXamfBmGPHJZ8X6ipwpn4WJ3_k_aYGf1d6paBRtDli7Llk6sVBPOy3CpTJKE",
    });

    if (!token) {
      console.log("No FCM token generated");
      return null;
    }

    console.log("FCM Token:", token);

    // Save token in Django
    await api.post("notifications/save-fcm-token/", {
      token: token,
    });

    console.log("FCM Token saved successfully");

    return token;
  } catch (error) {
    console.error("FCM Error:", error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Foreground Notification:", payload);

      resolve(payload);
    });
  });

export default messaging;
