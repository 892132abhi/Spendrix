import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    company_name: '',
    department: '',
    linked_in: '',
    bio: '',
    skills: [], 
    experience_years: 0
  });

  const [profilePic, setProfilePic] = useState(null);
  const [resume, setResume] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('accounts/profile/');
        const data = response.data;
        const skillsArray = data.skills 
          ? data.skills.split(',').map(s => s.trim()).filter(s => s !== "") 
          : [];

        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          company_name: data.company_name || '',
          department: data.department || '',
          linked_in: data.linked_in || '',
          bio: data.bio || '',
          skills: skillsArray, 
          experience_years: data.experience_years || 0,
        });

        if (data.profile_pic) setPreview(`http://localhost${data.profile_pic}`);
      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim() !== '') {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
      }
      setSkillInput('');
    }
  };

  const removeSkill = (indexToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, index) => index !== indexToRemove)
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (e.target.name === 'profile_pic') {
      setProfilePic(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setResume(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const data = new FormData();
    let finalSkills = [...formData.skills];
    if (skillInput.trim() !== "" && !finalSkills.includes(skillInput.trim())) {
      finalSkills.push(skillInput.trim());
    }
    Object.keys(formData).forEach(key => {
      if (key === 'skills') {
        data.append(key, finalSkills.join(', ')); 
      } else {
        data.append(key, formData[key]);
      }
    });
    if (profilePic) data.append('profile_pic', profilePic);
    if (resume) data.append('resume', resume);

    try {
      await api.patch('accounts/profileupdate/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Identity Records Synced!");
      navigate('/profile');
    } catch (err) {
      toast.error("Update failed. Verify entries.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-amber-600 tracking-widest">Profile ...</div>;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] border border-orange-100 shadow-2xl overflow-hidden">
        
        <header className="bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 p-10 text-white border-b-2 border-amber-500">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-orange-400">Edit Identity</h1>
          <p className="text-amber-500/70 text-sm font-bold uppercase tracking-widest mt-1">Professional Records </p>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-gradient-to-b from-white to-amber-50/10">
          
          <div className="flex items-center gap-8 pb-8 border-b border-amber-100">
            <div className="w-28 h-28 rounded-[1.5rem] bg-stone-50 overflow-hidden border-4 border-amber-100 shadow-xl">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl bg-stone-900">✨</div>}
            </div>
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">Profile Crest / Avatar Image</label>
                <input type="file" name="profile_pic" accept="image/*" onChange={handleFileChange} className="text-xs font-black text-orange-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-amber-200 file:bg-amber-50 file:text-amber-800 hover:file:bg-amber-100 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WarmInputGroup label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
            <WarmInputGroup label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
            <WarmInputGroup label="Experience (Years)" name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} />
            <WarmInputGroup label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">Professional Narrative Bio</label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Formulate your profile bio statement..."
              className="w-full px-6 py-4 bg-stone-50 border border-stone-200/80 rounded-[1.5rem] text-sm focus:bg-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all h-32 resize-none shadow-inner text-stone-800 font-medium"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">Capabilities & Core Stack (Press Enter)</label>
            <input 
              type="text" 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="e.g. React, Python Rest Framework, AWS Architecture"
              className="w-full px-6 py-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-sm focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner text-stone-800 font-bold"
            />
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="px-4 py-2 bg-gradient-to-r from-stone-900 to-stone-800 text-amber-400 border border-amber-500/30 text-[10px] font-black rounded-xl flex items-center gap-2 animate-in zoom-in-75 shadow-md">
                  {skill.toUpperCase()}
                  <button type="button" onClick={() => removeSkill(index)} className="text-orange-500 hover:text-orange-400 transition-colors">✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WarmInputGroup label="Enterprise Affiliate" name="company_name" value={formData.company_name} onChange={handleChange} />
            <WarmInputGroup label="Operational Department" name="department" value={formData.department} onChange={handleChange} />
            <div className="md:col-span-2">
               <WarmInputGroup label="LinkedIn Profile Ecosystem Link" name="linked_in" value={formData.linked_in} onChange={handleChange} />
            </div>
          </div>

          <div className="p-8 bg-stone-950 rounded-[2rem] border border-amber-500/20 text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-amber-400 mb-1">Dossier Portfolio Resume</h4>
                <p className="text-stone-400 text-[10px] font-bold uppercase tracking-widest">Premium PDF Vault Structure</p>
            </div>
            <input type="file" name="resume" accept=".pdf" onChange={handleFileChange} className="text-xs font-black text-amber-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-amber-500 file:text-stone-950 cursor-pointer shadow-2xl" />
          </div>

          <div className="flex justify-end gap-6 pt-6">
            <button type="button" onClick={() => navigate(-1)} className="text-[10px] font-black uppercase text-stone-400 hover:text-orange-600 transition-colors tracking-widest">Discard</button>
            <button type="submit" disabled={saving} className="px-12 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-stone-950 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.3em] shadow-lg shadow-orange-500/10 transition-all disabled:opacity-50 active:scale-95">
              {saving ? 'SYNCING DATA...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const WarmInputGroup = ({ label, name, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-stone-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    <input 
      type={type}
      name={name} 
      value={value} 
      onChange={onChange}
      className="w-full px-6 py-4 bg-stone-50 border border-stone-200/80 rounded-2xl text-sm font-bold text-stone-700 focus:bg-white focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 outline-none transition-all shadow-inner"
    />
  </div>
);

export default EditProfilePage;