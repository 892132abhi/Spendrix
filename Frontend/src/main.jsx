import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Toaster} from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import {GoogleOAuthProvider} from '@react-oauth/google'
import { requestForToken, onMessageListener } from './firebase'
const FirebaseNotificationInitializer = ({ children }) => {
  useEffect(() => {
    // 1. Request notification permissions and fetch the unique device token
    requestForToken().then((token) => {
      if (token) {
        console.log("FCM Token captured in main.jsx:", token);
        // Next up: Send this token to your Django backend via axios/fetch
      }
    });

    // 2. Set up the foreground notification listener using react-hot-toast
    onMessageListener()
      .then((payload) => {
        console.log("Foreground notification intercepted:", payload);
        
        // Display a beautiful toast message instead of a generic browser alert
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {payload.notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {payload.notification.body}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 5000 });
      })
      .catch((err) => console.error('Error tracking foreground messaging: ', err));
  }, []);

  return <>{children}</>;
};
createRoot(document.getElementById('root')).render(
  
  <StrictMode>
    <GoogleOAuthProvider clientId='859450987498-s5mkv4ceor9m6h2709644p23ttfobljd.apps.googleusercontent.com'>
    <BrowserRouter>
    <Toaster position='top-left' reverseOrder={false}/>
    <App />
    </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
  
)
