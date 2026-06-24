import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/instance';
import { FiArrowLeft, FiBriefcase, FiMapPin, FiCalendar, FiDollarSign, FiAward, FiFileText, FiUpload, FiSettings } from 'react-icons/fi';

const CreateJobPage = () => {
  const navigate = useNavigate();
  const [generatingJD, setGeneratingJD] = useState(false);
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
const handleGenerateJD = async () => {
  const { title, job_type, experience, Qualification, skills, location } = formData;

  if (!title || !job_type || !skills) {
    toast.error("Fill in Job Title, Job Type and Skills first");
    return;
  }
   setGeneratingJD(true);
  const loadingToast = toast.loading('Generating job description...');

  try {
    const res = await api.post('ai_gateway/jobs/generate-jd/', {
      title,
      job_type,
      experience,
      Qualification,
      skills,
      location,
    });

    setFormData(prev => ({ ...prev, description: res.data.description }));
    toast.success('JD generated — review and edit before publishing', { id: loadingToast });
  } catch (err) {
    console.error("JD generation failed:", err);
    const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to generate JD";
    toast.error(msg, { id: loadingToast });
  } finally {
    setGeneratingJD(false);
  }
};
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
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 font-sans px-4">

      {/* HEADER */}
      <header className="flex items-center justify-between text-left mt-6">
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[10px] font-black text-slate-400 hover:text-indigo-650 uppercase tracking-[0.2em] transition-colors mb-2.5 flex items-center gap-2 cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to List
          </button>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Post a New Position
          </h1>
          <p className="text-xs text-slate-400 mt-1">Add new vacancies and specify skill requirements for candidates.</p>
        </div>
      </header>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 md:p-10 shadow-xl space-y-10 text-left"
      >

        {/* BASIC INFO */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FiBriefcase className="text-indigo-500 w-4.5 h-4.5" />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
              Basic Information
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Job Title
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                type="text"
                placeholder="e.g. Senior Python Developer"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Job Type
              </label>
              <div className="relative">
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-bold text-slate-600 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none appearance-none cursor-pointer"
                >
                  <option value="FULL_TIME">Full Time</option>
                  <option value="PART_TIME">Part Time</option>
                  <option value="INTERN_SHIP">Internship</option>
                  <option value="REMOTE">Remote</option>
                </select>
                <div className="absolute right-4 top-4.5 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0"></div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Location
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-4.5 top-4 text-slate-450 w-4 h-4" />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  type="text"
                  placeholder="e.g. Bengaluru, India"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>
            </div>

          </div>
        </section>

        {/* REQUIREMENTS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FiAward className="text-indigo-500 w-4.5 h-4.5" />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
              Requirements & Compensation
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Years of Experience
              </label>
              <input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                type="number"
                min="0"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Salary Range
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-4.5 top-4 text-slate-450 w-4 h-4" />
                <input
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  type="text"
                  placeholder="e.g. ₹12L - ₹18L"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Job Expiry (Days)
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-4.5 top-4 text-slate-450 w-4 h-4" />
                <input
                  name="expiry_days"
                  value={formData.expiry_days}
                  onChange={handleChange}
                  type="number"
                  min="1"
                  placeholder="e.g. 7"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Required Qualification
              </label>
              <input
                name="Qualification"
                value={formData.Qualification}
                onChange={handleChange}
                type="text"
                placeholder="e.g. B.Tech, MCA, or relevant Certification"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Required Skills (Comma Separated)
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                placeholder="List skills separated by commas (e.g. Python, Django, AWS)"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 min-h-[100px] outline-none resize-y transition-all"
              />
            </div>

          </div>
        </section>

        {/* DESCRIPTION */}
<section className="space-y-4">
  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
    <div className="flex items-center gap-2">
      <FiFileText className="text-indigo-500 w-4.5 h-4.5" />
      <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
        Role Description
      </h3>
    </div>

    <button
      type="button"
      onClick={handleGenerateJD}
      disabled={generatingJD}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
    >
      {generatingJD ? "Generating..." : "✨ Generate with AI"}
    </button>
  </div>

  <textarea
    name="description"
    value={formData.description}
    onChange={handleChange}
    required
    placeholder="Describe the responsibilities and day-to-day tasks, or click Generate with AI..."
    className="w-full px-5 py-4 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 min-h-[180px] outline-none resize-y transition-all"
  />
</section>

        {/* BUTTONS */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/15 transition-all active:scale-95 cursor-pointer"
          >
            Publish Job Posting
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;
