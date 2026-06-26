import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/instance';
import { FiArrowLeft, FiBriefcase, FiMapPin, FiDollarSign, FiAward, FiFileText, FiEdit3, FiSave, FiXCircle } from 'react-icons/fi';

const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generatingJD, setGeneratingJD] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    skills: '',
    salary: '',
    experience: 0,
    location: '',
    job_type: 'FULL_TIME',
    job_status: 'OPEN'
  });

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const response = await api.get(`jobs/singlejoblist/${id}/`);
        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        toast.error("Failed to load job details.");
        navigate('/hr-jobs');
      }
    };
    fetchJobDetails();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'experience' ? (value === "" ? 0 : parseInt(value)) : value
    });
  };

  const handleGenerateJD = async () => {
    const { title, job_type, experience, skills, location } = formData;

    if (!title || !job_type || !skills) {
      toast.error("Fill in Job Title, Job Type and Skills first");
      return;
    }

    setGeneratingJD(true);
    const loadingToast = toast.loading('Generating job description...');

    try {
      const res = await api.post('ai/jobs/generate-jd/', {
        title,
        job_type,
        experience,
        skills,
        location,
      });

      setFormData(prev => ({ ...prev, description: res.data.description }));
      toast.success('JD generated — review and edit before saving', { id: loadingToast });
    } catch (err) {
      console.error("JD generation failed:", err);
      const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to generate JD";
      toast.error(msg, { id: loadingToast });
    } finally {
      setGeneratingJD(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Updating job details...');

    try {
      await api.put(`jobs/editjob/${id}/`, formData);
      toast.success('Job updated successfully!', { id: loadingToast });
      navigate('/hr-jobs');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || "Update failed. Please try again.";
      toast.error(errorMessage, { id: loadingToast });
    }
  };

  if (loading) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-slate-50/50">
      <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">
        Retrieving Data Assets...
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4 font-sans">
      <header className="flex items-center justify-between text-left mt-6">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-[10px] font-black text-slate-400 hover:text-indigo-650 uppercase tracking-[0.2em] transition-colors mb-2.5 flex items-center gap-2 cursor-pointer"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Cancel Edit
          </button>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FiEdit3 className="text-indigo-500 w-7 h-7" />
            Modify Position
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Vacancy Reference ID: #{id}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white/85 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-8 md:p-10 shadow-xl space-y-10">

        {/* CORE DETAILS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FiBriefcase className="text-indigo-500 w-4.5 h-4.5" />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Core Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Job Title</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                type="text"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Job Type</label>
              <div className="relative">
                <select
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-bold text-slate-650 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none appearance-none cursor-pointer"
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
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Location</label>
              <div className="relative">
                <FiMapPin className="absolute left-4.5 top-4 text-slate-450 w-4 h-4" />
                <input
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  type="text"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* COMPENSATION & REQS */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <FiAward className="text-indigo-500 w-4.5 h-4.5" />
            <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Requirements & Compensation</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Years of Experience</label>
              <input
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                type="number"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Salary Range</label>
              <div className="relative">
                <FiDollarSign className="absolute left-4.5 top-4 text-slate-450 w-4 h-4" />
                <input
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  type="text"
                  className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 transition-all outline-none"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2 ml-1">Required Skills (Comma Separated)</label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 min-h-[100px] outline-none resize-y transition-all"
              />
            </div>
          </div>
        </section>

        {/* ROLE DESCRIPTION */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FiFileText className="text-indigo-500 w-4.5 h-4.5" />
              <h3 className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Update Description</h3>
            </div>

            <button
              type="button"
              onClick={handleGenerateJD}
              disabled={generatingJD}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {generatingJD ? "Generating..." : "Generate Jd"}
            </button>
          </div>

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 min-h-[180px] outline-none resize-y transition-all"
          />
        </section>

        {/* ACTIONS BUTTONS */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            className="flex-1 bg-indigo-650 hover:bg-indigo-750 text-black py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/15 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiSave className="w-4 h-4" />
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <FiXCircle className="w-4 h-4" />
            Discard
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPage;