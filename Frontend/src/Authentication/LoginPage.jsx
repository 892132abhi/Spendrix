import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Update state as user types
  const handleChange = (e) => {
    if (error) setError(''); // Clear error banner when user types
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  // Centralized error handler for both Standard and Social login
  const handleError = (err, defaultMsg) => {
    const message = err.response?.data?.detail || err.response?.data?.message || defaultMsg;
    setError(message);
    toast.error(message);
  };

  // --- Standard Username/Password Login ---
  const redirectByRole = (user) => {
  switch (user.role) {
    case 'ADMIN':
      navigate('/admin-dashboard');
      break;
    case 'HR':
      navigate('/hr-dashboard');
      break;
    case 'INTERVIEWER':
      navigate('/interviewer-dashboard');
      break;
    default:
      navigate('/');
  }
};
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await api.post('accounts/login/', credentials);
      
      // Save user object (ID, Username, Email, and crucial ROLE) to localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success(`Welcome back, ${response.data.user.username}!`);
      redirectByRole(response.data.user);
      // Send everyone to the root path. 
      // The Dashboard switcher will handle the role-based view.
    } catch (err) {
      handleError(err, 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  // --- Google Login Logic (Access Token Flow) ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        const response = await api.post('accounts/google/', { 
          token: tokenResponse.access_token 
        });
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        toast.success('Signed in with Google');
        redirectByRole(response.data.user);
      } catch (err) {
        handleError(err, 'Google Authentication failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error("Google login was cancelled or blocked")
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 text-sky-600 rounded-full mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Spendrix Login</h2>
          <p className="text-slate-500 mt-2">Access your personalized dashboard</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm animate-pulse flex justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="font-bold">×</button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              type="text" 
              name="username" 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50/50" 
              placeholder="Enter username" 
              required 
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <button 
                type="button" 
                onClick={() => navigate("/reset-password")} 
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                Forgot password?
              </button>
            </div>
            <input 
              type="password" 
              name="password" 
              onChange={handleChange} 
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50/50" 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-lg shadow-lg active:scale-[0.98] disabled:opacity-70 flex justify-center items-center transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Social Divider */}
        <div className="mt-6">
          <div className="relative mb-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <span className="relative bg-white px-2 text-xs text-slate-400 uppercase font-medium">
              Or continue with
            </span>
          </div>

          {/* Social Buttons */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => googleLogin()}
              className="w-full flex justify-center items-center border border-slate-200 rounded-xl py-2.5 hover:bg-slate-50 transition-all cursor-pointer h-11"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.273 0 3.191 2.691 1.145 6.655l4.121 3.11z" />
                <path fill="#34A853" d="M16.04 18.013c-1.09.593-2.325.913-3.64.913a7.065 7.065 0 0 1-7.134-4.854l-4.121 3.11c2.046 3.964 6.128 6.655 10.855 6.655 2.932 0 5.711-1.039 7.898-2.82l-3.858-3.004z" />
                <path fill="#4285F4" d="M19.834 20.864C22.396 18.783 24 15.63 24 12c0-.661-.065-1.305-.184-1.927H12v4.814h6.707a5.82 5.82 0 0 1-2.527 3.82l3.654 3.157z" />
                <path fill="#FBBC05" d="M5.266 14.072A7.037 7.037 0 0 1 4.909 12c0-.724.104-1.423.298-2.083l-4.121-3.11A11.94 11.94 0 0 0 0 12c0 1.897.442 3.687 1.227 5.273l3.961-3.201z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-600">
            New to Spendrix?{' '}
            <button 
              onClick={() => navigate('/registerpage')} 
              className="font-semibold text-sky-600 hover:underline underline-offset-4"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;