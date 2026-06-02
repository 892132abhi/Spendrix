import { useState } from "react";
import api from "../api/instance";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const inviteToken = searchParams.get("invite_token");
  const isInviteRegistration = Boolean(inviteToken);

  const [loading, setLoading] = useState(false);

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

    // --- CRITICAL FIX: Added missing "try" wrapper ---
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
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4 font-sans text-stone-900">
      <div className="w-full max-w-md bg-white border border-orange-100 rounded-[2.5rem] shadow-2xl p-8 space-y-6 relative overflow-hidden">
        
        {/* Visual Luxury Top Accent Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500"></div>
        
        <div className="text-center pt-2">
          <h2 className="text-2xl font-black text-stone-950 tracking-tighter uppercase italic">
            {isInviteRegistration
              ? "Accept Interview Invitation"
              : "Create An Account"}
          </h2>

          <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
            {isInviteRegistration
              ? "Register to continue as an authorized interviewer"
              : "Join the Spendrix Platform Board"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1 ml-1">
              Username Handle
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 focus:bg-white rounded-xl text-sm font-semibold outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1 ml-1">
              Email Address Destination
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 focus:bg-white rounded-xl text-sm font-semibold outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1 ml-1">
              Secure Password
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 focus:bg-white rounded-xl text-sm outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-1 ml-1">
              Verify Password Signature
            </label>
            <input
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-stone-50/50 border border-stone-200 focus:bg-white rounded-xl text-sm outline-none focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all"
            />
          </div>

          {!isInviteRegistration && (
            <div className="space-y-2 pt-2">
              <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">
                Operational Identity Intent:
              </label>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "CANDIDATE" })}
                  className={`py-3 px-4 border-2 rounded-xl font-black text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all ${
                    form.role === "CANDIDATE"
                      ? "border-amber-500 bg-amber-50/40 text-amber-950 shadow-inner"
                      : "border-stone-100 text-stone-500 hover:border-stone-200"
                  }`}
                >
                  <span className="text-xl">🔱</span>
                  Apply for Track
                </button>

                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "HR" })}
                  className={`py-3 px-4 border-2 rounded-xl font-black text-[10px] uppercase tracking-wider flex flex-col items-center gap-1.5 transition-all ${
                    form.role === "HR"
                      ? "border-amber-500 bg-amber-50/40 text-amber-950 shadow-inner"
                      : "border-stone-100 text-stone-500 hover:border-stone-200"
                  }`}
                >
                  <span className="text-xl">🏛️</span>
                  Procure / Hire
                </button>
              </div>
            </div>
          )}

          {isInviteRegistration && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-center shadow-inner">
              <p className="text-xs font-bold text-amber-900 tracking-wide">
                Secure Key Detected: Registration tethered to panel invitation permissions.
              </p>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 font-black uppercase tracking-[0.2em] text-xs rounded-xl shadow-lg shadow-orange-500/10 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? "Authorizing Profile Ledger..." : isInviteRegistration ? "Accept Evaluation Key" : "Generate Core Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;