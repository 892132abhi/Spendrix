
import{initializeApp} from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api/instance";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID,
}

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
      vapidKey: import.meta.env.VITE_VAPID_KEY,
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
