import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';
import { FiArrowLeft, FiX, FiCheck, FiFileText } from 'react-icons/fi';

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
        headers: { 'Content-Type': undefined }
      });
      toast.success("Identity Records Synced!");
      navigate('/profile');
    } catch (err) {
      toast.error("Update failed. Verify entries.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 font-sans">
      <div className="max-w-3xl mx-auto bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">

        <header className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 p-8 text-white relative">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 text-slate-300 hover:text-white transition-colors bg-transparent border-none cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <FiArrowLeft size={14} />
            <span>Discard</span>
          </button>
          <div className="pt-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Edit Profile</h1>
            <p className="text-indigo-200/60 text-xs font-medium mt-1">Update your professional details and CV credentials</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">

          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            <div className="w-24 h-24 rounded-3xl bg-slate-50 overflow-hidden border border-slate-100 shadow-sm relative group flex-shrink-0">
              {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl bg-slate-100 text-slate-400">✨</div>}
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Crest / Avatar Image</label>
              <input type="file" name="profile_pic" accept="image/*" onChange={handleFileChange} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-200 file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100 cursor-pointer file:font-semibold" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IndigoInputGroup label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} />
            <IndigoInputGroup label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} />
            <IndigoInputGroup label="Experience (Years)" name="experience_years" type="number" value={formData.experience_years} onChange={handleChange} />
            <IndigoInputGroup label="Phone Number" name="phone_number" value={formData.phone_number} onChange={handleChange} />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Professional Biography</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell recruiters about yourself..."
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all h-32 resize-none text-slate-700 font-medium placeholder-slate-400"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Capabilities & Core Stack (Press Enter)</label>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={addSkill}
              placeholder="e.g. React, Python, AWS"
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-slate-700 font-semibold placeholder-slate-400"
            />
            <div className="flex flex-wrap gap-2">
              {formData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm">
                  {skill.toUpperCase()}
                  <button type="button" onClick={() => removeSkill(index)} className="text-slate-400 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 leading-none"><FiX /></button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <IndigoInputGroup label="Enterprise Affiliate" name="company_name" value={formData.company_name} onChange={handleChange} />
            <IndigoInputGroup label="Operational Department" name="department" value={formData.department} onChange={handleChange} />
            <div className="md:col-span-2">
              <IndigoInputGroup label="LinkedIn Profile Ecosystem Link" name="linked_in" value={formData.linked_in} onChange={handleChange} />
            </div>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FiFileText size={16} className="text-indigo-500" />
                <span>Curriculum Vitae Portfolio</span>
              </h4>
              <p className="text-slate-400 text-[10px] font-semibold mt-1">Upload a PDF copy of your resume</p>
            </div>
            <div className="relative">
              <input type="file" name="resume" accept=".pdf" onChange={handleFileChange} className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer file:font-semibold shadow-sm" />
              {resume && (
                <span className="absolute -bottom-6 left-0 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <FiCheck size={10} /> Selected: {resume.name.length > 20 ? `${resume.name.substring(0, 17)}...` : resume.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 border border-slate-200 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer bg-transparent uppercase tracking-wider">Discard</button>
            <button type="submit" disabled={saving} className="px-10 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-indigo-600/10 transition-all disabled:opacity-50 active:scale-98 cursor-pointer flex items-center gap-2">
              {saving ? 'SYNCING DATA...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const IndigoInputGroup = ({ label, name, value, onChange, type = "text" }) => (
  <div className="space-y-2">
    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
    />
  </div>
);

export default EditProfilePage;