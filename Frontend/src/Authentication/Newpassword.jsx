import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const SetNewPassword = () => {
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get the email and possibly the OTP/Token from the navigation state
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirm) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      await api.post('accounts/set-new-password/', { 
        email, 
        new_password: passwords.password 
      });
      alert("Password changed successfully!");
      navigate('/loginpage');
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Secure Your Account</h2>
          <p className="text-sm text-slate-500 mt-1.5">Please enter your new secure password below.</p>
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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm font-medium"
                onChange={(e) => setPasswords({...passwords, password: e.target.value})}
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

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm font-medium"
                onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showConfirm ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
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
                Updating...
              </span>
            ) : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetNewPassword;