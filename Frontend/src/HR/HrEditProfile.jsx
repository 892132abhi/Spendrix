import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiUser, FiPhone, FiLayers, FiLinkedin, FiBriefcase, FiFileText, FiSave, FiTag } from 'react-icons/fi';

const ProfileEdit = () => {
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

        if (data.profile_pic) setPreview(`${import.meta.env.VITE_API_URL}${data.profile_pic}`);
      } catch (err) {
        console.error("Profile sync error context:", err);
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
    const loadingToast = toast.loading('Synchronizing identity profile updates...');

    const data = new FormData();

    Object.keys(formData).forEach(key => {
      if (key === 'skills') {
        data.append(key, formData.skills.join(', '));
      } else if (key === 'experience_years') {
        // FIXED: Enforce clear integer casting so blank values don't pass broken text strings
        const years = parseInt(formData.experience_years, 10);
        data.append(key, isNaN(years) ? '0' : years.toString());
      } else {
        // FIXED: Fallback null or undefined keys safely to clean empty sequences
        data.append(key, formData[key] ?? '');
      }
    });

    if (profilePic) data.append('profile_pic', profilePic);
    if (resume) data.append('resume', resume);

    try {
      await api.patch('accounts/profileupdate/', data, {
        headers: { 'Content-Type': undefined }
      });
      toast.success("Profile updated successfully!", { id: loadingToast });
      navigate('/hr-profile');
    } catch (err) {
      console.error("Server trace response:", err.response?.data);

      // FIXED: Extract and print out explicit field verification bugs directly if thrown
      let errorMsg = "Update failed. Please check field inputs.";
      if (err.response?.data) {
        errorMsg = Object.entries(err.response.data)
          .map(([field, error]) => `${field.replace('_', ' ')}: ${error}`)
          .join(' | ');
      }
      toast.error(errorMsg, { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50">
      <div className="w-12 h-12 border-4 border-indigo-650 border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Identity Records...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden">

        <header className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-10 text-white relative">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-[0.2em] transition-colors mb-4 flex items-center gap-2 cursor-pointer bg-transparent border-0 outline-none"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight">Edit Identity</h1>
          <p className="text-slate-400 text-xs mt-1">Update your professional profile credentials and system metrics.</p>
        </header>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 text-left">

          {/* AVATAR SELECTOR */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-slate-100">
            <div className="w-24 h-24 rounded-3xl bg-slate-100 overflow-hidden border-4 border-white shadow-md relative shrink-0">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl bg-indigo-50 text-indigo-500">👤</div>
              )}
            </div>
            <div className="space-y-2.5 text-center sm:text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Avatar Image</label>
              <div className="relative inline-block cursor-pointer">
                <input
                  type="file"
                  name="profile_pic"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs font-semibold text-indigo-600 file:mr-4 file:py-2.5 file:px-4.5 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-650 hover:file:bg-indigo-100 cursor-pointer transition-colors"
                />
              </div>
            </div>
          </div>

          {/* NAME & GENERAL INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} icon={<FiUser className="w-4 h-4 text-slate-400" />} />
            <InputGroup label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} icon={<FiUser className="w-4 h-4 text-slate-400" />} />
            <InputGroup label="Experience (Years)" name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} icon={<FiBriefcase className="w-4 h-4 text-slate-400" />} />
            <InputGroup label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} icon={<FiPhone className="w-4 h-4 text-slate-400" />} />
          </div>

          {/* BIO */}
          <div className="space-y-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Professional Bio</label>
            <p className="text-[10px] text-slate-400 mt-0.5 tracking-wider"></p>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell your story..."
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all h-32 resize-none"
            />
          </div>

          {/* SKILLS TAG LIST */}
          <div className="space-y-3">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-1.5">
              <FiTag className="w-3.5 h-3.5 text-indigo-550" />
              Skills & Stack (Press Enter to add)
            </label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="e.g. React, Python, UI Design"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {formData.skills.map((skill, index) => (
                <span key={index} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-full shadow-sm">
                  {skill.toUpperCase()}
                  <button type="button" onClick={() => removeSkill(index)} className="hover:text-indigo-900 transition-colors cursor-pointer text-xs font-bold bg-transparent border-0 p-0 outline-none">✕</button>
                </span>
              ))}
            </div>
          </div>

          {/* COMPANY INFO */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputGroup label="Company" name="company_name" value={formData.company_name} onChange={handleChange} icon={<FiBriefcase className="w-4 h-4 text-slate-400" />} />
            <InputGroup label="Department" name="department" value={formData.department} onChange={handleChange} icon={<FiLayers className="w-4 h-4 text-slate-400" />} />
            <div className="md:col-span-2">
              <InputGroup label="LinkedIn Profile URL" name="linked_in" value={formData.linked_in} onChange={handleChange} icon={<FiLinkedin className="w-4 h-4 text-slate-400" />} />
            </div>
          </div>

          {/* RESUME UPLOADER */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white flex flex-col md:flex-row justify-between items-center gap-6 border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-indigo-400 flex items-center justify-center">
                <FiFileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider">Professional Resume</h4>
                <p className="text-[9px] text-slate-400 uppercase mt-0.5 tracking-wider">PDF format preferred</p>
              </div>
            </div>
            <input
              type="file"
              name="resume"
              accept=".pdf"
              onChange={handleFileChange}
              className="text-xs font-semibold text-slate-300 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-white file:text-slate-900 hover:file:bg-slate-200 cursor-pointer shadow-md"
            />
          </div>

          {/* FORM ACTIONS */}
          <div className="flex justify-end items-center gap-6 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[10px] font-black uppercase text-slate-400 hover:text-rose-500 transition-colors tracking-widest cursor-pointer bg-transparent border-0 outline-none"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-600/15 transition-all disabled:opacity-50 active:scale-95 flex items-center gap-2 cursor-pointer border-0 outline-none"
            >
              <FiSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, name, value, onChange, type = "text", icon }) => (
  <div className="space-y-2">
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-3.5 pointer-events-none">{icon}</div>}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3 bg-slate-50 border border-slate-200/70 rounded-2xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all`}
      />
    </div>
  </div>
);

export default ProfileEdit;