import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/instance';

const CreateCompanyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    location: '',
    description: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const nextStep = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return toast.error("Company Name is strictly mandatory.");
    }
    setCurrentStep(2);
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(false);

    const loadingToast = toast.loading('Initializing corporate tenant workspace...');
    setLoading(true);

    try {
      await api.post('company/initialize-workspace/', formData);
      
      toast.success('Workspace established successfully!', { id: loadingToast });
      
      navigate('/hr-dashboard');
      
      window.location.reload();
    } catch (error) {
      console.error("Workspace initialization failed:", error);
      const errorMessage = error.response?.data?.detail || "Failed to initialize company. Please check required fields.";
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-sans text-left">
      
      
      <header className="space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Setup Your Workspace</h1>
        <p className="text-xs font-black text-slate-400 tracking-widest uppercase">
          Establish your multi-tenant brand sandbox inside Spendrix
        </p>
      </header>

      <div className="flex items-center gap-4 max-w-xs bg-slate-100 p-1.5 rounded-full border border-slate-200/40">
        <div className={`flex-1 text-center py-2 rounded-full font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${currentStep === 1 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>
          01. Identity
        </div>
        <div className={`flex-1 text-center py-2 rounded-full font-black text-[10px] tracking-widest uppercase transition-all duration-300 ${currentStep === 2 ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400'}`}>
          02. Profile
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-xl border border-white rounded-[2.5rem] p-10 shadow-2xl shadow-slate-200/50">
        
        {currentStep === 1 && (
          <form onSubmit={nextStep} className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Core Registration Data</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Company Corporate Name *</label>
                <input 
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Stripe Inc."
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Corporate Email Address</label>
                  <input 
                    type="email"
                    name="email"
                    placeholder="e.g. hr@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Contact Phone Number</label>
                  <input 
                    type="text"
                    name="phone"
                    placeholder="e.g. +1 (555) 019-2834"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-10 py-4 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl transition-all duration-300"
              >
                Continue Workflow →
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Localization & Brand Scope</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Official Website URL</label>
                  <input 
                    type="url"
                    name="website"
                    placeholder="e.g. https://stripe.com"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Headquarters Location</label>
                  <input 
                    type="text"
                    name="location"
                    placeholder="e.g. San Francisco, CA"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">About / Company Overview Description</label>
                <textarea 
                  name="description"
                  placeholder="Describe the company's core services, technical vision, and operating cultural pillars..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-6 py-4 bg-slate-50/80 border border-slate-100 rounded-2xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 transition-all min-h-[160px] outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
              >
                ← Back
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-xl shadow-indigo-100 transition-all disabled:opacity-50"
              >
                {loading ? "Allocating Studio Tenant..." : "Launch Corporate Studio ✨"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default CreateCompanyPage;