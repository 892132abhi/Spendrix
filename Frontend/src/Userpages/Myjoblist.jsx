import { useState, useEffect } from 'react';
import api from '../api/instance'; 
import { toast } from 'react-hot-toast';
import { FiBriefcase, FiCalendar, FiTrash2, FiActivity } from 'react-icons/fi';

const MyApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const response = await api.get('applications/applicationlist/');
        setApplications(response.data);
      } catch (err) {
        toast.error("Failed to load applications ledger.");
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const handleWithdraw = async (id) => {
    if (window.confirm("Are you sure you want to withdraw this application? This action cannot be undone.")) {
      try {
        await api.delete(`applications/withdraw/${id}/`);
        setApplications(prev => prev.filter(app => app.id !== id));
        toast.success("Application withdrawn successfully.");
      } catch (err) {
        toast.error("Failed to withdraw application.");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'INTERVIEW': 
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'APPLIED': 
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'SHORT_LISTED': 
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'REJECTED': 
        return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'HIRED': 
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold';
      default: 
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getStep = (status) => {
    const steps = { 'APPLIED': 1, 'SHORT_LISTED': 2, 'INTERVIEW': 3, 'HIRED': 4 };
    return steps[status] || 0;
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const stepsList = [
    { key: 'APPLIED', label: 'Applied' },
    { key: 'SHORT_LISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interviewing' },
    { key: 'HIRED', label: 'Hired' }
  ];

  return (
    <div className="space-y-8 bg-transparent p-1 font-sans">
      <header className="border-b border-slate-100 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Active Applications</h1>
        <p className="text-slate-500 text-sm mt-1">Track and monitor your job applications progression loop.</p>
      </header>

      <div className="grid gap-6">
        {applications.map((app) => {
          const currentStep = getStep(app.status);
          const isRejected = app.status === 'REJECTED';

          return (
            <div 
              key={app.id} 
              className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md hover:border-slate-200/60 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                
                {/* Details Section */}
                <div className="flex items-start gap-5 min-w-0">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold text-lg border border-indigo-100/50 shadow-sm flex-shrink-0">
                    {app.job_title?.charAt(0).toUpperCase() || <FiBriefcase />}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-900 truncate">{app.job_title}</h3>
                    <p className="text-sm font-semibold text-slate-500 mt-0.5">{app.company_name || "Enterprise Segment"}</p>
                    
                    <div className="flex items-center gap-4 mt-3 flex-wrap">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                        {app.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <FiCalendar size={13} />
                        <span>{app.applied_at_date}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar and timeline */}
                <div className="flex-1 max-w-lg lg:px-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiActivity size={12} className="text-indigo-500" />
                      <span>Progression Pipeline</span>
                    </span>
                    {isRejected && (
                      <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                        Archived
                      </span>
                    )}
                  </div>

                  {/* Horizontal steps display */}
                  <div className="grid grid-cols-4 gap-2 relative">
                    {stepsList.map((step, idx) => {
                      const stepIndex = idx + 1;
                      const isActive = !isRejected && currentStep >= stepIndex;
                      
                      return (
                        <div key={step.key} className="text-center">
                          <div className="relative flex items-center justify-center">
                            {/* Line connecting points */}
                            {idx > 0 && (
                              <div className={`absolute right-1/2 left-0 top-1/2 -translate-y-1/2 h-[3px] -z-10 ${
                                !isRejected && currentStep >= stepIndex ? 'bg-indigo-600' : 'bg-slate-100'
                              }`} />
                            )}
                            {idx < 3 && (
                              <div className={`absolute left-1/2 right-0 top-1/2 -translate-y-1/2 h-[3px] -z-10 ${
                                !isRejected && currentStep > stepIndex ? 'bg-indigo-600' : 'bg-slate-100'
                              }`} />
                            )}

                            {/* Node point */}
                            <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                              isActive 
                                ? 'bg-indigo-600 border-indigo-600 ring-4 ring-indigo-500/10 scale-110' 
                                : isRejected && stepIndex === 1 
                                  ? 'bg-rose-500 border-rose-500' 
                                  : 'bg-white border-slate-200'
                            }`} />
                          </div>
                          
                          <p className={`text-[10px] font-bold mt-2 truncate tracking-wide ${
                            isActive ? 'text-indigo-600' : 'text-slate-400'
                          }`}>
                            {step.label}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Withdraw button */}
                <div className="flex-shrink-0">
                  <button 
                    onClick={() => handleWithdraw(app.id)}
                    className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/30 rounded-xl text-xs font-semibold transition-all active:scale-98 cursor-pointer"
                  >
                    <FiTrash2 size={13} />
                    <span>Withdraw</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}

        {applications.length === 0 && (
          <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-[2rem] p-8">
            <p className="text-slate-400 font-semibold text-sm">No applications found in your tracking register.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyApplicationsPage;