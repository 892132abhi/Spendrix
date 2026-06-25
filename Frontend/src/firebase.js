
import{initializeApp} from "firebase/app"
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import api from "./api/instance";

const firebaseConfig = {
  apiKey: import.meta.env.apiKey,
  authDomain: import.meta.env.authDomain,
  projectId: import.meta.env.projectId,
  storageBucket: import.meta.env.storageBucket,
  messagingSenderId: import.meta.env.messagingSenderId,
  appId: import.meta.envappId,
  measurementId: import.meta.env.measurementId,
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
      vapidKey:import.meta.env.vapidKey,
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
