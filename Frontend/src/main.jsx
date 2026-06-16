import React, { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster, toast } from "react-hot-toast";

import "./index.css";
import App from "./App.jsx";

import {
  requestForToken,
  onMessageListener,
} from "./firebase";

const FirebaseNotificationInitializer = ({ children }) => {
  useEffect(() => {
    // 1. Check if the user is actually authenticated before doing anything
    const token = localStorage.getItem("access_token"); // or wherever you store your JWT token
    
    if (!token) {
      console.log("No auth token found. Skipping FCM registration until login.");
      return;
    }

    // 2. Only request & save token if authenticated
    requestForToken();

    // 3. Listen for foreground notifications
    onMessageListener()
      .then((payload) => {
        console.log("Foreground notification received:", payload);
        toast.success(
          `${payload.notification?.title || "Notification"}\n${
            payload.notification?.body || ""
          }`
        );
      })
      .catch((err) =>
        console.error("Foreground notification error:", err)
      );
  }, []); // Fires once on mount, but safely exits if unauthenticated

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId="859450987498-s5mkv4ceor9m6h2709644p23ttfobljd.apps.googleusercontent.com"
    >
      <BrowserRouter>
        <Toaster
          position="top-right"
          reverseOrder={false}
        />
        <FirebaseNotificationInitializer>
          <App />
        </FirebaseNotificationInitializer>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);