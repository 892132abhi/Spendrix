import axios from 'axios';

const api = axios.create({
  baseURL: `${window.location.origin}/api/`,
  // CRITICAL: This allows the browser to send/receive cookies (access & refresh tokens)
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
// Note: We NO LONGER attach Authorization headers manually. 
// The browser handles the cookies automatically.

// RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect 401 Unauthorized (Access Token expired)
    // Avoid retrying if it's already a login or refresh request
    const isAuthRequest = 
      originalRequest.url.includes('accounts/login/') ||
      originalRequest.url.includes('accounts/token/refresh/');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;

      try {
        // We call the refresh endpoint. 
        // The backend reads the 'refresh_token' cookie and sets a new access cookie.
        await api.post('accounts/token/refresh/');
        
        // Retry the original request (it will now use the new access cookie)
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the user must log in again
        console.error("Session expired");
        window.location.href = '/loginpage';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;