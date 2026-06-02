import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for seamless redirection
import api from "../api/instance";
import toast from "react-hot-toast";
const CreateCompanyPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    phone: "",
    description: "",
    otp: "",
  });

  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // SEND OTP
  const handleSendOtp = async () => {
    if (!formData.email) {
      toast.error("Please enter company email");
      return;
    }

    try {
      setLoading(true);
      // FIXED: Removed leading slash to ensure Axios preserves your /api/ prefix base path configuration
      const response = await api.post("company/send-company-otp/", {
        email: formData.email,
      });

      toast.success(response.data.detail || "OTP sent to the provided email.");
      setOtpSent(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail || "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
    if (!formData.otp) {
      toast.error("Please enter OTP");
      return;
    }

    try {
      setLoading(true);
      // FIXED: Removed leading slash to prevent base URL prefix clipping
      const response = await api.post("company/verify-company-otp/", {
        email: formData.email,
        otp: formData.otp,
      });

      toast.success(response.data.detail || "Company verified successfully.");
      setVerified(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail || "OTP verification failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // CREATE COMPANY
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!verified) {
      toast.error("Please verify email first");
      return;
    }

    try {
      setLoading(true);
      // FIXED: Removed leading slash to resolve URL assembly errors
      const response = await api.post("company/create-company/", {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        phone: formData.phone,
        description: formData.description,
      });

      toast.success(response.data.message || "Company workspace setup complete!");

      // RESET FORM
      setFormData({
        name: "",
        email: "",
        location: "",
        phone: "",
        description: "",
        otp: "",
      });

      setOtpSent(false);
      setVerified(false);

      // REDIRECT: Send the recruiter immediately to look at their completed workspace profile card!
      navigate("/my-company");

    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail || "Failed to create company"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center text-slate-800">
          Create Company
        </h1>

        <form onSubmit={handleSubmit}>
          {/* COMPANY NAME */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-700">
              Company Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter company name"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          {/* COMPANY EMAIL */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-700">
              Company Email
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter company email"
                required
                disabled={otpSent}
                className="flex-1 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-semibold disabled:bg-slate-50 disabled:text-slate-400"
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={verified || loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold px-5 text-xs uppercase tracking-wider rounded-lg transition"
              >
                {verified ? "Verified" : "Verify"}
              </button>
            </div>
          </div>

          {/* OTP FIELD */}
          {otpSent && !verified && (
            <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block mb-2 font-medium text-slate-700">
                Enter OTP
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  placeholder="Enter 6-digit OTP"
                  className="flex-1 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-semibold"
                />
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 text-xs uppercase tracking-wider rounded-lg transition"
                >
                  Verify OTP
                </button>
              </div>
            </div>
          )}

          {/* VERIFIED INDICATION TEXT */}
          {verified && (
            <p className="text-sm font-bold text-emerald-600 mb-4 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-1.5">
              <span>✅</span> Company email verified successfully
            </p>
          )}

          {/* LOCATION */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-700">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          {/* PHONE */}
          <div className="mb-4">
            <label className="block mb-2 font-medium text-slate-700">
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-semibold"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="mb-6">
            <label className="block mb-2 font-medium text-slate-700">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="About company..."
              rows="4"
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 font-semibold resize-none"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!verified || loading}
            className={`w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all ${
              verified && !loading
                ? "bg-slate-900 hover:bg-slate-800 shadow-md"
                : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            {loading ? "Processing Workspace Link..." : "Create Company Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCompanyPage;