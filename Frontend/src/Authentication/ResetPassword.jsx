import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';

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
      
      await api.post('accounts/password-reset/request-otp/', { email })
      setStep(2);
      setStatus({ type: 'success', message: 'OTP sent! Please check your email inbox.' });
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 transition-all duration-500">
        
        {/* Back Button */}
        <button 
          onClick={() => step === 1 ? navigate('/loginpage') : setStep(1)}
          className="group flex items-center text-sm font-medium text-slate-500 hover:text-sky-600 transition-colors mb-8"
        >
          <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          {step === 1 ? 'Back to Login' : 'Use different email'}
        </button>

        {/* Dynamic Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-colors ${step === 1 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {step === 1 
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              }
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            {step === 1 ? 'Reset Password' : 'Verify OTP'}
          </h2>
          <p className="text-slate-500 mt-2">
            {step === 1 
              ? 'Enter your email to receive a verification code.' 
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>

        {status.message && (
          <div className={`mb-6 p-4 rounded-lg text-sm border-l-4 animate-in fade-in slide-in-from-top-2 ${
            status.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            {status.message}
          </div>
        )}

        {step === 1 ? (
          /* STEP 1: EMAIL INPUT */
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all bg-slate-50/50"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-sky-100 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Checking email...' : 'Send Verification Code'}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP INPUT */
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-3xl font-bold tracking-[0.5em] text-emerald-600 focus:border-emerald-500 outline-none transition-all bg-slate-50"
                placeholder="000000"
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-100 transition-all active:scale-[0.98] disabled:opacity-50"
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