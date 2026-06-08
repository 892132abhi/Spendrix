import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/instance';

const CreateJobPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    salary: '',
    experience: 0,
    location: '',
    Qualification: '',
    job_type: 'FULL_TIME',
    job_status: 'OPEN',
    expiry_days: 3   // Default value remains 3
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert both experience and expiry_days to integers since they are numeric inputs
    const shouldParseInt = name === 'experience' || name === 'expiry_days';

    setFormData({
      ...formData,
      [name]: shouldParseInt
        ? (parseInt(value) || 0)
        : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading('Publishing job vacancy to your workspace...');

    try {
      await api.post('jobs/createjob/', formData);

      toast.success('Job created successfully!', { id: loadingToast });
      navigate('/hr-jobs');

    } catch (error) {
      console.error("Error creating job:", error);

      const errorMessage =
        error.response?.data?.detail || "Failed to create job. Check inputs.";

      toast.error(errorMessage, { id: loadingToast });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-sans">

      {/* HEADER */}
      <header className="flex items-center justify-between text-left">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors mb-2 flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to List
          </button>

          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Post a New Position
          </h1>
        </div>
      </header>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 space-y-10 text-left"
      >

        {/* BASIC INFO */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
            Basic Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Job Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                type="text"
                placeholder="e.g. Senior Python Developer"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Job Type
              </label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERN_SHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Location
              </label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                type="text"
                placeholder="e.g. Bengaluru, India"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

          </div>
        </section>

        {/* REQUIREMENTS */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
            Requirements & Compensation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Years of Experience
              </label>
              <input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                type="number"
                min="0"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Salary Range
              </label>
              <input
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                type="text"
                placeholder="e.g. ₹12L - ₹18L"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            {/* ✅ UPDATED TO NUMBER INPUT */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Job Expiry (Days)
              </label>
              <input
                name="expiry_days"
                value={formData.expiry_days}
                onChange={handleChange}
                type="number"
                min="1"
                placeholder="e.g. 7"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Required Qualification
              </label>
              <input
                name="Qualification"
                value={formData.Qualification}
                onChange={handleChange}
                type="text"
                placeholder="e.g. B.Tech, MCA, or relevant Certification"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">
                Required Skills
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                placeholder="List skills separated by commas (e.g. Python, Django, AWS)"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-h-[100px] outline-none"
              />
            </div>

          </div>
        </section>

        {/* DESCRIPTION */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">
            Role Description
          </h3>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Describe the responsibilities and day-to-day tasks..."
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-h-[200px] outline-none"
          />
        </section>

        {/* BUTTONS */}
        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-4">

          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all"
          >
            Publish Job Posting
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>

        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;