import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/instance";
import { toast } from "react-hot-toast";
import { FiMail } from "react-icons/fi";

const VerifyEmail = () => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const navigate = useNavigate();
  const location = useLocation();

  const username =
    location.state?.username || localStorage.getItem("verify_username");

  const canResend = timer === 0;

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!username) {
      setError("Username missing. Please register again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("accounts/verify-otp/", { username, otp });

      localStorage.removeItem("verify_username");

      toast.success("OTP verified", {
        style: {
          borderRadius: "12px",
          background: "#334155",
          color: "#fff",
        },
      });

      navigate("/loginpage");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!username) {
      setError("Username missing. Please register again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("accounts/request-otp/", {
        username,
        resend: true,
      });

      setTimer(60);
      toast.success("A new code has been sent to your email!");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to resend email. Please try again."
      );
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
            <FiMail className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Check your email</h2>
          <p className="text-sm text-slate-500 mt-1.5 px-4">
            Verification code sent to{" "}
            <span className="font-semibold text-slate-700">
              {username || "your account"}
            </span>
          </p>
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

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 text-center uppercase tracking-wider">Verification Code</label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full py-3 border border-slate-200 rounded-xl text-center text-2xl font-bold tracking-[0.5em] text-indigo-600 focus:border-indigo-500 outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50/50"
              maxLength="6"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center transition-all cursor-pointer text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Confirming...
              </span>
            ) : "Confirm Code"}
          </button>
        </form>

        <div className="mt-8 text-center pt-5 border-t border-slate-100">
          {canResend ? (
            <button
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 cursor-pointer"
              onClick={handleResend}
              disabled={loading}
            >
              Resend Verification Email
            </button>
          ) : (
            <p className="text-sm font-medium text-slate-400">
              Resend code available in{" "}
              <span className="text-indigo-600 font-semibold">{timer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;