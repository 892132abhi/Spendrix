import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiEdit3, FiUser, FiMail, FiPhone, FiLinkedin, FiBriefcase, FiLayers, FiFileText, FiDownload, FiCheckCircle } from 'react-icons/fi';

const HrProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${window.location.origin}${path}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('accounts/profile/'); 
        setProfile(response.data);
      } catch (err) {
        console.log("error found :", err);
        toast.error("Failed to load profile details");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
      <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Profile Assets...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      <nav className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/60 py-4 mb-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="text-slate-500 hover:text-indigo-650 flex items-center gap-2 font-bold text-sm transition-colors cursor-pointer"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">HR Profile Management</h1>
          <button 
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-600/15 flex items-center gap-1.5 cursor-pointer" 
            onClick={() => navigate("/hr-editprofile")}
          >
            <FiEdit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PRIMARY CARD */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200/60 p-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/60 to-white -z-10"></div>
            
            <div className="w-32 h-32 mx-auto rounded-3xl bg-white p-1.5 shadow-md mb-6 relative group">
              {profile?.profile_pic ? (
                <img src={getMediaUrl(profile.profile_pic)} className="w-full h-full object-cover rounded-[1.2rem]" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-4xl font-extrabold rounded-[1.2rem]">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
              {profile?.full_name}
            </h2>
            <p className="text-indigo-600 text-[10px] font-black uppercase tracking-wider bg-indigo-50/70 inline-flex items-center gap-1 px-4 py-1.5 rounded-full border border-indigo-100/60 mb-6">
              <FiCheckCircle className="w-3 h-3 text-indigo-500" />
              {profile?.role?.replace('_', ' ')}
            </p>

            <div className="space-y-4.5 text-left pt-6 border-t border-slate-100">
               <DetailItem label="Username" value={`@${profile?.username}`} icon={<FiUser className="w-4 h-4 text-slate-400" />} />
               <DetailItem label="Email" value={profile?.email} icon={<FiMail className="w-4 h-4 text-slate-400" />} />
               <DetailItem label="Phone" value={profile?.phone_number || 'Not provided'} icon={<FiPhone className="w-4 h-4 text-slate-400" />} />
            </div>
          </section>

          {profile?.linked_in && (
            <a 
              href={profile.linked_in} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-between p-5 bg-[#0077b5] rounded-2xl text-white hover:bg-[#006396] hover:-translate-y-0.5 transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                <FiLinkedin className="w-4.5 h-4.5" />
                Professional LinkedIn
              </span>
              <span>➔</span>
            </a>
          )}
        </div>

        {/* RIGHT COLUMN: DETAIL SECTIONS */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* WORK PANEL */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FiBriefcase className="w-4 h-4 text-slate-400" />
              Work Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FiBriefcase className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Company</p>
                  <p className="text-base font-extrabold text-slate-800">{profile?.company_name || 'N/A'}</p>
                </div>
              </div>
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-100 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <FiLayers className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Department</p>
                  <p className="text-base font-extrabold text-slate-800">{profile?.department || 'N/A'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* CREDENTIALS/RESUME PANEL */}
          <section className="bg-white rounded-3xl border border-slate-200/60 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <FiFileText className="w-4 h-4 text-slate-400" />
                Credentials
              </h3>
              <span className="text-[8px] font-black px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">PDF DOCUMENT</span>
            </div>
            {profile?.resume ? (
              <div className="flex items-center p-5 bg-indigo-50/40 rounded-2xl border border-dashed border-indigo-150">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm mr-5 shrink-0">
                  <FiFileText className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-850 truncate">Professional_Resume.pdf</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Verified Professional Resume</p>
                </div>
                <a 
                  href={getMediaUrl(profile.resume)} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-5 py-2.5 bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white font-black text-[10px] uppercase rounded-xl border border-indigo-100 hover:border-indigo-600 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                  <span>View</span>
                </a>
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/70 rounded-2xl border-2 border-dashed border-slate-150">
                <p className="text-slate-450 font-bold text-xs italic">No resume has been uploaded yet.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-center gap-3.5 p-1">
    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black text-slate-450 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default HrProfilePage;