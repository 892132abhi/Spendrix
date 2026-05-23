import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/instance';
import { toast } from 'react-hot-toast';

const CreateInterviewPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  const [interviewers, setInterviewers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [assignmentMode, setAssignmentMode] = useState('existing');

  const [formData, setFormData] = useState({
    application: '',
    interviewer: '',
    interviewer_email: '',
    sheduled_date: '',
    meeting_link: '',
    note: '',
    status: 'SHEDULED'
  });

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [intRes, appRes] = await Promise.all([
          api.get('interviews/lookups/interviewers/'),
          api.get('interviews/lookups/applications/')
        ]);
        setInterviewers(intRes.data);
        setApplications(appRes.data);
      } catch (err) {
        console.log("error found :", err);
        toast.error("Failed to load recruiter or candidate lists.");
      } finally {
        setFetchingOptions(false);
      }
    };

    fetchOptions();
  }, []);

  const handleAssignmentModeChange = (mode) => {
    setAssignmentMode(mode);
    setErrors({});

    if (mode === 'existing') {
      setFormData({
        ...formData,
        interviewer_email: ''
      });
    } else {
      setFormData({
        ...formData,
        interviewer: ''
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const buildPayload = () => {
    const payload = {
      application: formData.application,
      sheduled_date: formData.sheduled_date,
      meeting_link: formData.meeting_link,
      note: formData.note,
      status: formData.status
    };

    if (assignmentMode === 'existing') {
      payload.interviewer = formData.interviewer;
    } else {
      payload.interviewer_email = formData.interviewer_email;
    }

    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await api.post('interviews/createinterview/', buildPayload());
      toast.success("Interview scheduled successfully!");
      navigate('/interviews');
    } catch (err) {
      if (err.response?.status === 400) {
        setErrors(err.response.data);
        toast.error("Please fix the highlighted errors.");
      } else {
        toast.error("Server error. Could not schedule interview.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchingOptions) {
    return (
      <div className="p-20 text-center font-black animate-pulse">
        LOADING DASHBOARD ASSETS...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Schedule New Interview
          </h1>
          <p className="text-slate-500 font-medium">
            Coordinate with candidates and set up meeting details.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Select Application
                  </label>
                  <select
                    name="application"
                    value={formData.application}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none transition-all ${
                      errors.application
                        ? 'border-red-500'
                        : 'border-slate-100 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="">Choose Candidate...</option>
                    {applications.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.candidate_username} - {app.job_title}
                      </option>
                    ))}
                  </select>
                  {errors.application && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.application[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Assignment Type
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAssignmentModeChange('existing')}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        assignmentMode === 'existing'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}
                    >
                      Existing
                    </button>

                    <button
                      type="button"
                      onClick={() => handleAssignmentModeChange('invite')}
                      className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        assignmentMode === 'invite'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-500 border-slate-100'
                      }`}
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </div>

              {assignmentMode === 'existing' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Assign Interviewer
                  </label>
                  <select
                    name="interviewer"
                    value={formData.interviewer}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none transition-all ${
                      errors.interviewer
                        ? 'border-red-500'
                        : 'border-slate-100 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  >
                    <option value="">Select Interviewer...</option>
                    {interviewers.map(hr => (
                      <option key={hr.id} value={hr.id}>
                        {hr.full_name} ({hr.email})
                      </option>
                    ))}
                  </select>
                  {errors.interviewer && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.interviewer[0]}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Interviewer Email
                  </label>
                  <input
                    type="email"
                    name="interviewer_email"
                    value={formData.interviewer_email}
                    onChange={handleChange}
                    placeholder="interviewer@example.com"
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none transition-all ${
                      errors.interviewer_email
                        ? 'border-red-500'
                        : 'border-slate-100 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.interviewer_email && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.interviewer_email[0]}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    name="sheduled_date"
                    value={formData.sheduled_date}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm outline-none ${
                      errors.sheduled_date
                        ? 'border-red-500'
                        : 'border-slate-100 focus:ring-2 focus:ring-indigo-500'
                    }`}
                  />
                  {errors.sheduled_date && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.sheduled_date[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Meeting Link
                  </label>
                  <input
                    type="url"
                    name="meeting_link"
                    value={formData.meeting_link}
                    placeholder="https://zoom.us/..."
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-slate-50 border rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none ${
                      errors.meeting_link ? 'border-red-500' : 'border-slate-100'
                    }`}
                  />
                  {errors.meeting_link && (
                    <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                      {errors.meeting_link[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Interview Notes
                </label>
                <textarea
                  name="note"
                  rows="4"
                  value={formData.note}
                  onChange={handleChange}
                  placeholder="Mention topics to cover..."
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-3xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${
                    errors.note ? 'border-red-500' : 'border-slate-100'
                  }`}
                />
                {errors.note && (
                  <p className="text-[10px] text-red-500 font-bold ml-1 italic">
                    {errors.note[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <h3 className="text-xs font-black uppercase tracking-widest mb-6 opacity-60">
                Status Control
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl">
                  <span className="text-xs font-bold italic text-indigo-300">
                    SHEDULED
                  </span>
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                >
                  {loading ? 'Processing...' : 'Confirm Schedule'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInterviewPage;