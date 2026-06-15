import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { useGoogleLogin } from '@react-oauth/google';
import { FiUser, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginPage = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4 font-sans text-slate-800 relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl p-8 sm:p-10 transition-all duration-300 relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl mb-4 border border-indigo-100 shadow-sm shadow-indigo-100/50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Spendrix</h2>
          <p className="text-sm text-slate-500 mt-1.5">Welcome back! Please enter your details to sign in.</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-sm flex justify-between items-start animate-fade-in">
            <div className="flex gap-2">
              <svg className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 transition-colors font-bold line-none">×</button>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiUser className="w-4 h-4" />
              </div>
              <input 
                type="text" 
                name="username" 
                onChange={handleChange} 
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm font-medium" 
                placeholder="Enter your username" 
                required 
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
              <button 
                type="button" 
                onClick={() => navigate("/reset-password")} 
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiLock className="w-4 h-4" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                onChange={handleChange} 
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm" 
                placeholder="••••••••" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        {/* Social Divider */}
        <div className="mt-6">
          <div className="relative mb-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-100"></span>
            </div>
            <span className="relative bg-white px-3 text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Google Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => googleLogin()}
              disabled={loading}
              className="w-full flex justify-center items-center gap-2.5 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 hover:bg-slate-50/50 active:scale-[0.99] transition-all cursor-pointer h-11 text-slate-600 hover:text-slate-800 font-semibold text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.273 0 3.191 2.691 1.145 6.655l4.121 3.11z" />
                <path fill="#34A853" d="M16.04 18.013c-1.09.593-2.325.913-3.64.913a7.065 7.065 0 0 1-7.134-4.854l-4.121 3.11c2.046 3.964 6.128 6.655 10.855 6.655 2.932 0 5.711-1.039 7.898-2.82l-3.858-3.004z" />
                <path fill="#4285F4" d="M19.834 20.864C22.396 18.783 24 15.63 24 12c0-.661-.065-1.305-.184-1.927H12v4.814h6.707a5.82 5.82 0 0 1-2.527 3.82l3.654 3.157z" />
                <path fill="#FBBC05" d="M5.266 14.072A7.037 7.037 0 0 1 4.909 12c0-.724.104-1.423.298-2.083l-4.121-3.11A11.94 11.94 0 0 0 0 12c0 1.897.442 3.687 1.227 5.273l3.961-3.201z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            New to Spendrix?{' '}
            <button 
              onClick={() => navigate('/registerpage')} 
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 cursor-pointer"
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
