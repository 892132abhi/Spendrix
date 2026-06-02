import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const InterviewerEditprofile = () => {
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

        if (data.profile_pic) setPreview(`http://127.0.0.1:8000${data.profile_pic}`);
      } catch (err) {
        console.log("found error :", err);
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
    
    Object.keys(formData).forEach(key => {
      if (key === 'skills') {
        
        data.append(key, formData.skills.join(', '));
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
      toast.success("Profile updated!");
      navigate('/profile');
    } catch (err) {
      console.log(err.response?.data);
      toast.error("Update failed. Check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">Profile ...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden">
        
        <header className="bg-slate-900 p-10 text-white">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Edit Identity</h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-1">Professional Records </p>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          
          <div className="flex items-center gap-8 pb-8 border-b border-slate-100">
            <div className="w-28 h-28 rounded-[2rem] bg-slate-100 overflow-hidden border-4 border-white shadow-xl">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>}
            </div>
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Avatar Image</label>
                <input type="file" name="profile_pic" accept="image/*" onChange={handleFileChange} className="text-xs font-black text-indigo-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
            <InputGroup label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
            <InputGroup label="Experience (Years)" name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} />
            <InputGroup label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Professional Bio</label>
            <textarea 
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell your story..."
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all h-32 resize-none shadow-inner"
            />
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Skills & Stack (Press Enter to add)</label>
            <input 
              type="text" 
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="e.g. React, Python, UI Design"
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
            />
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-xl flex items-center gap-2 animate-in zoom-in-75 shadow-lg shadow-indigo-100">
                  {skill.toUpperCase()}
                  <button type="button" onClick={() => removeSkill(index)} className="hover:text-white/60 transition-colors">✕</button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Company" name="company_name" value={formData.company_name} onChange={handleChange} />
            <InputGroup label="Department" name="department" value={formData.department} onChange={handleChange} />
            <div className="md:col-span-2">
               <InputGroup label="LinkedIn Profile" name="linked_in" value={formData.linked_in} onChange={handleChange} />
            </div>
          </div>

          <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] mb-1"> Resume</h4>
            </div>
            <input type="file" name="resume" accept=".pdf" onChange={handleFileChange} className="text-xs font-black text-slate-400 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-white file:text-slate-900 cursor-pointer shadow-2xl" />
          </div>

          <div className="flex justify-end gap-6 pt-10">
            <button type="button" onClick={() => navigate(-1)} className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors tracking-widest">Discard</button>
            <button type="submit" disabled={saving} className="px-12 py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-100 hover:bg-slate-900 transition-all disabled:opacity-50 active:scale-95">
              {saving ? 'SYNCING...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{label}</label>
    <input 
      type={type}
      name={name} 
      value={value} 
      onChange={onChange}
      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-inner"
    />
  </div>
);

export default InterviewerEditprofile;