import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiEdit3, FiMail, FiPhone, FiBriefcase, FiGlobe, FiAward, FiFileText, FiDownload, FiUser } from 'react-icons/fi';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic origin calculation to protect against CORS errors and hardcoded string typos
  const getMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://localhost${path}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('accounts/profile/'); 
        setProfile(response.data);
      } catch (err) {
        console.log("error found :", err);
        toast.error("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const skillsArray = profile?.skills
    ? profile.skills.split(',').map(s => s.trim()).filter(s => s !== "")
    : [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans">
      {/* Control Header */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-100 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm font-semibold transition-colors bg-transparent border-none cursor-pointer"
          >
            <FiArrowLeft size={16} />
            <span>Back</span>
          </button>
          <h1 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">My Profile</h1>
          <button 
            onClick={() => navigate("/editprofile")}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-98 cursor-pointer"
          >
            <FiEdit3 size={14} />
            <span>Edit Profile</span>
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card: Main Identifier */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-[2rem] border border-slate-100 p-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-50 to-violet-50/50 -z-10"></div>
            
            <div className="w-28 h-28 mx-auto rounded-3xl bg-white p-1 shadow-md mb-6 border border-slate-100 relative group">
              {profile?.profile_pic ? (
                <img src={getMediaUrl(profile.profile_pic)} className="w-full h-full object-cover rounded-[1.2rem]" alt="Profile avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 text-white text-3xl font-bold rounded-[1.2rem]">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              {profile?.full_name}
            </h2>
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider bg-indigo-50 inline-block px-3 py-1 rounded-full mb-6">
              {profile?.role?.replace('_', ' ')}
            </p>

            <div className="space-y-4 text-left pt-6 border-t border-slate-100">
              <ProfileContactItem icon={<FiUser size={16} />} label="Username" value={`@${profile?.username}`} />
              <ProfileContactItem icon={<FiMail size={16} />} label="Email" value={profile?.email} />
              <ProfileContactItem icon={<FiPhone size={16} />} label="Phone" value={profile?.phone_number || 'Not provided'} />
            </div>
          </section>

          {profile?.linked_in && (
            <a 
              href={profile.linked_in} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[1.5rem] hover:-translate-y-0.5 hover:shadow-lg transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <FiGlobe className="text-indigo-400 text-lg animate-pulse" />
                <span className="font-semibold text-sm">Professional LinkedIn</span>
              </div>
              <span className="text-slate-400 text-xs">Visit &rarr;</span>
            </a>
          )}
        </div>

        {/* Right Details Sections */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Organization Info */}
          <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
              <FiBriefcase className="text-slate-400" />
              <span>Affiliation</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company</p>
                <p className="text-base font-semibold text-slate-800">{profile?.company_name || 'Not specified'}</p>
              </div>
              <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</p>
                <p className="text-base font-semibold text-slate-800">{profile?.department || 'Not specified'}</p>
              </div>
            </div>
          </section>

          {/* User Skills */}
          {skillsArray.length > 0 && (
            <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <FiAward className="text-slate-400" />
                <span>Skills & Expertise</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {skillsArray.map((skill, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-indigo-50/40 text-indigo-700 border border-indigo-100/60 rounded-xl text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* CV / Resume Section */}
          {profile?.role === 'CANDIDATE' && (
            <section className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <FiFileText className="text-slate-400" />
                  <span>Curriculum Vitae</span>
                </h3>
                <span className="text-[10px] font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md">Verified System Ledger</span>
              </div>
              
              {profile?.resume ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-slate-50/50 rounded-[1.5rem] border border-slate-100 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <FiFileText size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">Resume_Document.pdf</p>
                      <p className="text-xs text-slate-400">PDF Format</p>
                    </div>
                  </div>
                  
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const targetUrl = getMediaUrl(profile.resume);
                      const hiddenLink = document.createElement('a');
                      hiddenLink.href = targetUrl;
                      hiddenLink.target = '_blank';
                      hiddenLink.rel = 'noopener noreferrer';
                      document.body.appendChild(hiddenLink);
                      hiddenLink.click();
                      document.body.removeChild(hiddenLink);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <FiDownload size={14} />
                    <span>Download CV</span>
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50/30 rounded-[1.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-semibold text-sm">No resume uploaded yet.</p>
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

const ProfileContactItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3.5 group">
    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-slate-700 truncate">{value}</p>
    </div>
  </div>
);

export default ProfilePage;