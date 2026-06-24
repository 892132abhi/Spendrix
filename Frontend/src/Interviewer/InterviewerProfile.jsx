import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const InterviewerProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `${import.meta.env.VITE_API_URL}${path}`;
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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 mb-8">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-indigo-600 flex items-center font-bold text-sm transition-colors">
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            Back
          </button>
          <h1 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Interviewer Profile Management</h1>
          <button className="px-6 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100" onClick={()=>navigate("/interviewer-editprofile")}>
            Edit Profile
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 text-center shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50 to-white -z-10"></div>
            
            <div className="w-32 h-32 mx-auto rounded-3xl bg-white p-1.5 shadow-xl mb-6 relative group">
              {profile?.profile_pic ? (
                <img src={getMediaUrl(profile.profile_pic)} className="w-full h-full object-cover rounded-[1.2rem]" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-600 text-white text-4xl font-black rounded-[1.2rem]">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none mb-2">
              {profile?.full_name}
            </h2>
            <p className="text-indigo-600 text-[10px] font-black uppercase tracking-widest bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100 mb-8">
              {profile?.role?.replace('_', ' ')}
            </p>

            <div className="space-y-4 text-left pt-6 border-t border-slate-100">
               <DetailItem label="Username" value={`@${profile?.username}`} icon="👤" />
               <DetailItem label="Email" value={profile?.email} icon="✉️" />
               <DetailItem label="Phone" value={profile?.phone_number || 'Not provided'} icon="📞" />
            </div>
          </section>

          {profile?.linked_in && (
            <a href={profile.linked_in} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-[#0077b5] rounded-3xl text-white hover:-translate-y-1 transition-all shadow-lg shadow-blue-100">
              <span className="font-bold text-sm">Professional LinkedIn</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          )}
        </div>

        <div className="lg:col-span-8 space-y-6">
          
          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Company</p>
                <p className="text-lg font-black text-slate-800">{profile?.company_name || 'N/A'}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Department</p>
                <p className="text-lg font-black text-slate-800">{profile?.department || 'N/A'}</p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Credentials</h3>
              </div>
              <span className="text-[9px] font-black px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 uppercase tracking-wider">PDF DOCUMENT</span>
            </div>
            {profile?.resume ? (
              <div className="space-y-6">
                <div className="flex items-center p-6 bg-white rounded-[2rem] border border-dashed border-slate-900">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm mr-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-base font-bold text-slate-900 tracking-tight leading-tight">Professional_Resume.pdf</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">VERIFIED PROFESSIONAL RESUME</p>
                  </div>
                  <a href={getMediaUrl(profile.resume)} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-bold text-xs uppercase rounded-2xl border border-indigo-100 shadow-sm hover:bg-indigo-600 hover:text-white transition-all cursor-pointer">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    VIEW
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-100">
                <p className="text-slate-400 font-bold text-sm italic">No resume has been uploaded yet.</p>
              </div>
            )}
          </section>

        </div>
      </main>
    </div>
  );
};

const DetailItem = ({ label, value, icon }) => (
  <div className="flex items-center gap-3">
    <span className="text-lg grayscale">{icon}</span>
    <div>
      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-slate-600 truncate max-w-[180px]">{value}</p>
    </div>
  </div>
);

export default InterviewerProfilePage;                                                                                                                                                                                                                                                                                                                               