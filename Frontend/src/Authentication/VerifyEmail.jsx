import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/instance";
import { toast } from "react-hot-toast";

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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-200 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full mb-6">
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h2 className="text-3xl font-bold text-slate-800">
            Check your email
          </h2>

          <p className="text-slate-500 mt-3 px-4">
            Verification code sent to{" "}
            <span className="font-semibold text-slate-700">
              {username || "your account"}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl text-center text-3xl font-bold tracking-[0.5em] text-emerald-600 focus:border-emerald-500 outline-none bg-slate-50"
            maxLength="6"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
          >
            {loading ? "Verifying..." : "Confirm Code"}
          </button>
        </form>

        <div className="mt-8 text-center">
          {canResend ? (
            <button
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 underline decoration-2 underline-offset-4"
              onClick={handleResend}
              disabled={loading}
            >
              Resend Verification Email
            </button>
          ) : (
            <p className="text-sm font-medium text-slate-400">
              Resend available in{" "}
              <span className="text-emerald-600">{timer}s</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;