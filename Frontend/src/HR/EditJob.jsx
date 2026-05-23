import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/instance';

const EditJobPage = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">
        Retrieving Data Assets...
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-indigo-600 transition-colors mb-2 flex items-center gap-2"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Cancel Edit
          </button>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Modify Position</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Job ID: #{id}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-xl border border-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 space-y-10">
        
        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Core Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Job Title</label>
              <input 
                name="title" 
                value={formData.title}
                onChange={handleChange}
                required
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Job Type</label>
              <select 
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none"
              >
                <option value="FULL_TIME">Full Time</option>
                <option value="PART_TIME">Part Time</option>
                <option value="INTERN_SHIP">Internship</option>
                <option value="REMOTE">Remote</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Location</label>
              <input 
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Requirements & Compensation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Years of Experience</label>
              <input 
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                type="number" 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Salary Range</label>
              <input 
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                type="text" 
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-black text-slate-700 uppercase tracking-widest mb-2">Required Skills</label>
              <textarea 
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-h-[100px] outline-none"
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Update Description</h3>
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-[2rem] text-sm font-medium focus:ring-2 focus:ring-indigo-500 min-h-[200px] outline-none"
          />
        </section>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-4">
          <button 
            type="submit"
            className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95"
          >
            Save Changes
          </button>
          <button 
            type="button"
            onClick={() => navigate(-1)}
            className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPage;