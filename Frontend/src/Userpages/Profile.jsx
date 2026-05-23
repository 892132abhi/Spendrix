import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMediaUrl = (path) => {
    if (!path) return null;
    return path.startsWith('http') ? path : `http://127.0.0.1:8000${path}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('accounts/profile/'); 
        setProfile(response.data);
      } catch (err) {
        console.log("error found :",err)
        toast.error("Failed to load official database profile credentials.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-12 text-stone-900">
      {/* LUXURY PROFILE CONTROL LINE */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-amber-100 py-4 mb-8 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="text-stone-500 hover:text-orange-600 flex items-center font-black text-xs uppercase tracking-widest transition-colors">
            ← Back
          </button>
          <h1 className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">Profile</h1>
          <button className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 rounded-full text-xs font-black uppercase tracking-widest shadow-md transition-all" onClick={()=>navigate("/editprofile")}>
            Edit Profile
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SIDE CREST IDENTIFIER */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-[2.5rem] border border-orange-100 p-8 text-center shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-50 to-white -z-10"></div>
            
            <div className="w-32 h-32 mx-auto rounded-3xl bg-white p-1.5 shadow-xl mb-6 border-2 border-amber-400 relative group">
              {profile?.profile_pic ? (
                <img src={getMediaUrl(profile.profile_pic)} className="w-full h-full object-cover rounded-[1.2rem]" alt="Crest Identification" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-stone-950 text-amber-400 text-4xl font-black rounded-[1.2rem] border border-amber-500/30">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-2xl font-black text-stone-950 tracking-tight uppercase italic mb-2">
              {profile?.full_name}
            </h2>
            <p className="text-amber-950 text-[10px] font-black uppercase tracking-widest bg-amber-100 border border-amber-300 inline-block px-4 py-1 rounded-full mb-8">
              {profile?.role?.replace('_', ' ')} 
            </p>

            <div className="space-y-4 text-left pt-6 border-t border-stone-100">
               <LuxuryDetailItem label=" Username" value={`@${profile?.username}`} icon="👑" />
               <LuxuryDetailItem label=" Email " value={profile?.email} icon="✉️" />
               <LuxuryDetailItem label="contact" value={profile?.phone_number || 'No link cataloged'} icon="📞" />
            </div>
          </section>

          {profile?.linked_in && (
            <a href={profile.linked_in} target="_blank" rel="noreferrer" className="flex items-center justify-between p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-amber-400 border border-amber-500/30 rounded-3xl hover:-translate-y-0.5 transition-all shadow-lg">
              <span className="font-black text-xs uppercase tracking-widest"> LinkedIn </span>
              <span className="text-orange-500 text-xl">🔱</span>
            </a>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Bento Group Layout */}
          <section className="bg-white rounded-[2.5rem] border border-orange-100 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-8">official</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/60 shadow-inner">
                <p className="text-[10px] font-black text-amber-700 uppercase mb-1 tracking-wider">Company</p>
                <p className="text-lg font-black text-stone-900 uppercase italic tracking-tight">{profile?.company_name || 'None'}</p>
              </div>
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200/60 shadow-inner">
                <p className="text-[10px] font-black text-orange-600 uppercase mb-1 tracking-wider">Department</p>
                <p className="text-lg font-black text-stone-900 uppercase italic tracking-tight">{profile?.department ||'None'}</p>
              </div>
            </div>
          </section>

          {/* Credentials Dossier Item */}
          {profile?.role === 'CANDIDATE' && (
            <section className="bg-white rounded-[2.5rem] border border-orange-100 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Credentials & Records Ledger</h3>
                <span className="text-[9px] font-black px-3 py-1 bg-amber-100 text-amber-950 border border-amber-300 rounded uppercase tracking-widest">Secure Profile Vault</span>
              </div>
              {profile?.resume ? (
                <div className="flex items-center p-6 bg-amber-50/20 rounded-3xl border-2 border-dashed border-amber-300">
                  <div className="w-14 h-14 bg-stone-950 rounded-2xl flex items-center justify-center text-amber-400 shadow-md mr-6 border border-amber-500/20">
                    👑
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-stone-900 uppercase tracking-tight">CV_Official_Records.pdf</p>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide"></p>
                  </div>
                  <a href={getMediaUrl(profile.resume)} target="_blank" rel="noreferrer" className="px-6 py-2.5 bg-white text-orange-600 font-black text-[10px] uppercase rounded-xl border border-orange-200 shadow-sm hover:bg-stone-950 hover:text-amber-400 transition-all">
                    View 
                  </a>
                </div>
              ) : (
                <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-200">
                  <p className="text-stone-400 font-bold text-sm italic">No asset deployment documentation uploaded to current identity block.</p>
                </div>
              )}
            </section>
          )}

        </div>
      </main>
    </div>
  );
};

const LuxuryDetailItem = ({ label, value, icon }) => (
  <div className="flex items-center gap-3 group">
    <span className="text-base text-amber-600">{icon}</span>
    <div>
      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{label}</p>
      <p className="text-xs font-bold text-stone-700 truncate max-w-[180px]">{value}</p>
    </div>
  </div>
);

export default ProfilePage;