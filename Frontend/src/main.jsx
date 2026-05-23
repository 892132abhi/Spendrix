import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {Toaster} from 'react-hot-toast'
import { BrowserRouter } from 'react-router-dom'
import {GoogleOAuthProvider} from '@react-oauth/google'
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
