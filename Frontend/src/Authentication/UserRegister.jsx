import { useState } from "react";
import api from "../api/instance";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff, FiBriefcase, FiCompass } from "react-icons/fi";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const inviteToken = searchParams.get("invite_token");
  const isInviteRegistration = Boolean(inviteToken);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "CANDIDATE",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getErrorMessage = (data) => {
    if (!data) return "Registration failed";
    if (typeof data === "string") return data;

    return (
      data.detail ||
      data.message ||
      data.email?.[0] ||
      data.username?.[0] ||
      data.password?.[0] ||
      data.confirm_password?.[0] ||
      data.invite_token?.[0] ||
      "Registration failed"
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      return toast.error("Passwords do not match!");
    }

    setLoading(true);

    const payload = {
      username: form.username,
      email: form.email,
      password: form.password,
      confirm_password: form.confirm_password,
    };

    if (isInviteRegistration) {
      payload.invite_token = inviteToken;
    } else {
      payload.role = form.role;
    }

    try {
      await api.post("accounts/register/", payload);
      localStorage.setItem("verify_username", form.username);
      toast.success("Registration successful! OTP sent to your email.");

      setTimeout(() => {
        navigate("/verify-email", { state: { username: form.username } });
      }, 1000);
    } catch (err) {
      toast.error(getErrorMessage(err.response?.data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 p-4 font-sans text-slate-800 relative overflow-hidden">
      {/* Soft ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/20 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-white border border-slate-100 rounded-2xl shadow-xl hover:shadow-2xl p-8 sm:p-10 transition-all duration-300 relative z-10 my-8">

        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl mb-4 border border-indigo-100 shadow-sm shadow-indigo-100/50">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isInviteRegistration ? "Accept Invitation" : "Create Account"}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5">
            {isInviteRegistration
              ? "Register to join as an authorized interviewer"
              : "Get started with the Spendrix Hiring platform"}
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Username</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiUser className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm font-medium"
                placeholder="Choose a username"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Email Address</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm font-medium"
                placeholder="you@example.com"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm"
                placeholder="••••••••"
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

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Confirm Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirm_password"
                value={form.confirm_password}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-indigo-500 rounded-xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-slate-800 placeholder-slate-400 text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          {!isInviteRegistration && (
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">Select Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "CANDIDATE" })}
                  className={`py-3.5 px-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${form.role === "CANDIDATE"
                      ? "border-indigo-500 bg-indigo-50/40 text-indigo-950 shadow-sm"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/30"
                    }`}
                >
                  <FiCompass className={`w-5 h-5 transition-transform group-hover:scale-110 ${form.role === "CANDIDATE" ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Job Seeker</span>
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "HR" })}
                  className={`py-3.5 px-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center group cursor-pointer ${form.role === "HR"
                      ? "border-indigo-500 bg-indigo-50/40 text-indigo-950 shadow-sm"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50/30"
                    }`}
                >
                  <FiBriefcase className={`w-5 h-5 transition-transform group-hover:scale-110 ${form.role === "HR" ? "text-indigo-600" : "text-slate-400"}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">Employer / HR</span>
                </button>
              </div>
            </div>
          )}

          {isInviteRegistration && (
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 px-4 py-3 text-center shadow-inner">
              <p className="text-xs font-semibold text-indigo-800 tracking-wide">
                Invitation code detected. You will be registered as an interviewer.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3.5 rounded-xl shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center transition-all cursor-pointer text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </span>
              ) : isInviteRegistration ? (
                "Accept Invite & Register"
              ) : (
                "Create Account"
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-5 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/loginpage")}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline underline-offset-4 cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;