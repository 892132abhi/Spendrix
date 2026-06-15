import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { FiMail, FiLock, FiArrowLeft } from 'react-icons/fi';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      await api.post('accounts/password-reset/request-otp/', { email });
      setStep(2);
      setStatus({ type: 'success', message: 'Verification OTP sent to your email inbox.' });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'Account not found with this email.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('accounts/password-reset/verify-otp/', { email, otp });
      navigate('/new-password', { state: { email } });
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Invalid or expired OTP.'
      });
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
        
        {/* Back Button */}
        <button 
          onClick={() => step === 1 ? navigate('/loginpage') : setStep(1)}
          className="group flex items-center text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-6 cursor-pointer"
        >
          <FiArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
          {step === 1 ? 'Back to Sign In' : 'Use different email'}
        </button>

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 border shadow-sm transition-colors ${
            step === 1 
              ? 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50' 
              : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50'
          }`}>
            {step === 1 ? <FiLock className="w-5 h-5" /> : <FiMail className="w-5 h-5" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {step === 1 ? 'Reset Password' : 'Verify OTP'}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 px-4">
            {step === 1 
              ? 'Enter your email to receive a verification code.' 
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {/* Alerts */}
        {status.message && (
          <div className={`mb-6 p-3.5 rounded-xl text-sm border flex gap-2.5 items-start animate-fade-in ${
            status.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : 'bg-rose-50 border-rose-100 text-rose-800'
          }`}>
            <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${status.type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {status.type === 'success' 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              }
            </svg>
            <span>{status.message}</span>
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: EMAIL INPUT */
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                  <FiMail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm font-medium"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center transition-all cursor-pointer text-sm"
            >
              {loading ? 'Checking email...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP INPUT */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-600 text-center uppercase tracking-wider">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full py-3 border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] text-emerald-600 focus:border-emerald-500 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all bg-slate-50/50"
                placeholder="000000"
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-emerald-600/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center transition-all cursor-pointer text-sm"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;