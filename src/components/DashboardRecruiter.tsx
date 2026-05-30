import React, { useState, useEffect } from 'react';
import { Job, Application, RecruiterProfile, PortalDB, JobType, ExperienceLevel, ApplicationStatus } from '../data';
import { 
  Building2, Briefcase, PlusCircle, CheckCircle, XCircle, Trash2, Edit3, MapPin, 
  Globe, Mail, FileText, Check, Award, Eye, Clock, Users, ShieldCheck, AlertCircle, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardRecruiterProps {
  userId: string;
  onLogout: () => void;
}

export default function DashboardRecruiter({ userId, onLogout }: DashboardRecruiterProps) {
  // Profiles & DB State
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  
  // Tab controller
  const [activeTab, setActiveTab] = useState<'positions' | 'applicants' | 'company'>('positions');

  // Job post form state
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobType, setJobType] = useState<JobType>('Full-time');
  const [jobLevel, setJobLevel] = useState<ExperienceLevel>('Mid');
  const [jobLoc, setJobLoc] = useState('');
  const [salaryMin, setSalaryMin] = useState(1200000);
  const [salaryMax, setSalaryMax] = useState(2400000);
  const [jobSkillsRaw, setJobSkillsRaw] = useState('');
  const [jobRequirementsRaw, setJobRequirementsRaw] = useState('');

  // Applicant status modal
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState('');

  // Notification Toast state
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Profile forms
  const [compName, setCompName] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [compWeb, setCompWeb] = useState('');
  const [compLoc, setCompLoc] = useState('');

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const prof = PortalDB.getRecruiterProfile(userId);
    setProfile(prof);

    if (prof) {
      setCompName(prof.companyName);
      setCompDesc(prof.description);
      setCompWeb(prof.website);
      setCompLoc(prof.location);
    }

    // Filter jobs created by this Recruiter/Company
    const allJobs = PortalDB.getJobs().filter(j => j.recruiterId === userId);
    setJobs(allJobs);

    // Get all applications to jobs owned by this recruiter
    const jobIdsOwnedByMe = allJobs.map(j => j.id);
    const allApps = PortalDB.getApplications().filter(a => jobIdsOwnedByMe.includes(a.jobId));
    setApplications(allApps);
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Skip approval sandbox utility
  const handleSandboxApprove = () => {
    if (!profile) return;
    const approvedProfile = { ...profile, approved: true };
    PortalDB.saveRecruiterProfile(approvedProfile);
    setProfile(approvedProfile);
    showNotification('success', 'Sandbox mode: Recruiter profile approved instantly!');
  };

  // Job creation / moderation
  const openPostModal = (job: Job | null = null) => {
    if (job) {
      setEditingJob(job);
      setJobTitle(job.title);
      setJobDesc(job.description);
      setJobType(job.type);
      setJobLevel(job.experienceLevel);
      setJobLoc(job.location);
      setSalaryMin(job.salaryMin);
      setSalaryMax(job.salaryMax);
      setJobSkillsRaw(job.skills.join(', '));
      setJobRequirementsRaw(job.requirements.join(', '));
    } else {
      setEditingJob(null);
      setJobTitle('');
      setJobDesc('');
      setJobType('Full-time');
      setJobLevel('Mid');
      setJobLoc(profile?.location || 'Bangalore');
      setSalaryMin(800000);
      setSalaryMax(1600000);
      setJobSkillsRaw('');
      setJobRequirementsRaw('');
    }
    setShowJobModal(true);
  };

  const handleJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!jobTitle.trim() || !jobDesc.trim() || !jobLoc.trim()) {
      showNotification('error', 'Please fill in job title, description, and location.');
      return;
    }

    const skills = jobSkillsRaw.split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
      
    const requirements = jobRequirementsRaw.split(',')
      .map(r => r.trim())
      .filter(r => r.length > 0);

    const jobPayload: Job = {
      id: editingJob?.id || '',
      recruiterId: userId,
      companyName: profile.companyName,
      companyLogo: profile.logoUrl || profile.companyName.charAt(0),
      title: jobTitle,
      description: jobDesc,
      skills,
      requirements: requirements.length > 0 ? requirements : ['Strong logical skills'],
      location: jobLoc,
      salaryMin: Number(salaryMin),
      salaryMax: Number(salaryMax),
      type: jobType,
      experienceLevel: jobLevel,
      status: editingJob?.status || 'active',
      createdAt: editingJob?.createdAt || new Date().toISOString()
    };

    PortalDB.saveJob(jobPayload);
    showNotification('success', editingJob ? 'Job opportunity updated.' : 'Job opportunity posted successfully!');
    setShowJobModal(false);
    loadData();
  };

  const handleDeleteJob = (jobId: string) => {
    if (confirm('Are you sure you want to delete this job posting? This will remove related applicants.')) {
      PortalDB.deleteJob(jobId, profile?.email || userId);
      showNotification('success', 'Job posting removed!');
      loadData();
    }
  };

  // Applicant Status Transition submission
  const handleUpdateStatusSubmit = (e: React.FormEvent, status: ApplicationStatus) => {
    e.preventDefault();
    if (!selectedApp) return;

    PortalDB.updateApplicationStatus(selectedApp.id, status, statusChangeNote, profile?.email || 'hr@google.com');
    showNotification('success', `Candidate ${selectedApp.seekerName} set to: ${status}`);
    setSelectedApp(null);
    setStatusChangeNote('');
    loadData();
  };

  // Save Recruiter Profile Details
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updated: RecruiterProfile = {
      ...profile,
      companyName: compName,
      description: compDesc,
      website: compWeb,
      location: compLoc
    };

    PortalDB.saveRecruiterProfile(updated);
    setProfile(updated);
    showNotification('success', 'Company profile details saved successfully!');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
              notification.type === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-amber-600 text-xs font-bold uppercase tracking-wider">Recruiter Module</span>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mt-1">{profile?.companyName || 'Employer Dashboard'}</h1>
          <p className="text-slate-500 text-sm mt-1">Post job vacancies, screen applicant profiles, and schedule corporate reviews.</p>
        </div>
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => { loadData(); showNotification('success', 'Refreshed employer data'); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors"
            title="Refresh positions"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          
          <button
            type="button"
            onClick={() => openPostModal()}
            disabled={!profile?.approved}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs inline-flex items-center gap-1.5 transition-all outline-none ${
              profile?.approved
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer shadow-sm'
                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            Launch Position
          </button>
        </div>
      </div>

      {/* Recruiter Approval Guardian Bar */}
      {!profile?.approved && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl my-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">Verification Required</p>
              <p className="text-xs text-amber-700 leading-relaxed mt-1">
                Your recruiter profile is currently in the Administrative verification queue. You cannot launch positions or access contacts until vetted.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => alert('To test normal workflow: Log in as Chief Administrator "admin@jobportal.com" using the rapid switcher below, and approve this recruiter company under "Recruiter Verification"')}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-[11px] font-bold text-amber-800 rounded-lg cursor-pointer"
            >
              How to Vetch?
            </button>
            <button
              onClick={handleSandboxApprove}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-[11px] font-bold text-white rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              Skip: Approve Sandbox Profile
            </button>
          </div>
        </div>
      )}

      {/* Metrics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">My Active Postings</p>
          <div className="flex items-baseline justify-between mt-1.5">
            <h3 className="text-3xl font-display font-bold text-slate-800">
              {jobs.filter(j => j.status === 'active').length}
            </h3>
            <span className="text-xs text-slate-400">Total: {jobs.length}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Candidates applied</p>
          <div className="flex items-baseline justify-between mt-1.5">
            <h3 className="text-3xl font-display font-bold text-slate-800">
              {applications.length}
            </h3>
            <span className="text-xs text-brand-600 font-semibold">
              {applications.filter(a => a.status === 'Applied').length} unvetted
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Company Vetting Status</p>
            <h3 className={`text-sm font-bold flex items-center gap-1.5 mt-2 ${
              profile?.approved ? 'text-emerald-700' : 'text-amber-700'
            }`}>
              {profile?.approved ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Verified Corporate Employer
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-600" />
                  Pending Board Approval
                </>
              )}
            </h3>
          </div>
        </div>
      </div>

      {/* Sub menu controls */}
      <div className="flex border-b border-slate-200 gap-1 mb-8">
        <button
          onClick={() => setActiveTab('positions')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all ${
            activeTab === 'positions'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Positions Offered
        </button>
        <button
          onClick={() => setActiveTab('applicants')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all ${
            activeTab === 'applicants'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          Applicant Pipeline ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all ${
            activeTab === 'company'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Profile Manager
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'positions' && (
          <motion.div
            key="positions-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {jobs.map((job) => {
              const matchedAppsCount = applications.filter(a => a.jobId === job.id).length;

              return (
                <div key={job.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="text-lg font-display font-semibold text-slate-900">{job.title}</h3>
                        {job.status === 'flagged' && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-50 border border-rose-100 text-rose-700 uppercase tracking-widest rounded">
                            Flagged Fake
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                        <span>Salary: ₹{(job.salaryMin / 100000).toFixed(1)}L - {(job.salaryMax / 100000).toFixed(1)}L/yr</span>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{job.type}</span>
                        <span className="px-2 py-0.5 bg-brand-50 text-brand-700 border border-brand-100 rounded text-[10px] font-bold uppercase">{job.experienceLevel} Tier</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => openPostModal(job)}
                        className="p-2 border border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer transition-colors"
                        title="Edit position properties"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-2 border border-slate-100 hover:border-red-200 hover:bg-red-50 text-red-500 rounded-xl cursor-pointer transition-colors"
                        title="Delete vacancy"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 border-t border-slate-100 pt-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-3">
                    {job.skills.map(sk => (
                      <span key={sk} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] rounded border border-slate-200/40">
                        {sk}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 mt-4 pt-3 text-xs text-slate-400">
                    <span>Listed on {new Date(job.createdAt).toLocaleDateString()}</span>
                    <button
                      onClick={() => {
                        setActiveTab('applicants');
                      }}
                      className="text-brand-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Users className="w-3.5 h-3.5" />
                      View Applicants ({matchedAppsCount})
                    </button>
                  </div>
                </div>
              );
            })}

            {jobs.length === 0 && (
              <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-800 font-semibold">No job vacancies created yet</p>
                <p className="text-slate-400 text-xs mt-1">Click &quot;Launch Position&quot; key above to initialize your first offer listing!</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'applicants' && (
          <motion.div
            key="applicants-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {applications.map((app) => {
              const pairedJob = jobs.find(j => j.id === app.jobId) || { title: 'General Vacancy' };

              return (
                <div key={app.id} className="bg-white border border-slate-200 hover:border-slate-300 p-6 rounded-2xl shadow-sm transition-all">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <h4 className="font-display font-bold text-slate-900 group-hover:text-brand-600 text-lg">
                        {app.seekerName}
                      </h4>
                      <p className="text-slate-600 text-xs font-semibold">{app.seekerTitle}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                        <span className="bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                          Applying for: {pairedJob.title}
                        </span>
                        <span>Applied: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        app.status === 'Applied' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        app.status === 'Shortlisted' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        app.status === 'Interviewing' ? 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse' :
                        app.status === 'Offered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-red-50 text-red-600 border border-red-200'
                      }`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Screen Candidate
                      </button>
                    </div>
                  </div>

                  {app.resumeContent && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs text-slate-600 mb-4 space-y-1">
                      <p className="font-bold text-slate-700 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Resume Abstract Details ({app.resumeName}):
                      </p>
                      <p className="italic leading-relaxed">"{app.resumeContent}"</p>
                    </div>
                  )}

                  {app.coverLetter && (
                    <div className="text-xs text-slate-500">
                      <span className="font-bold text-slate-700 block mb-1">Applicant cover message:</span>
                      <p className="whitespace-pre-line bg-slate-50 p-3.5 rounded-xl text-[11px] italic">"{app.coverLetter}"</p>
                    </div>
                  )}
                </div>
              );
            })}

            {applications.length === 0 && (
              <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-800 font-semibold">Your Applicant pipeline is clear</p>
                <p className="text-slate-400 text-xs mt-1">Once you compile job listings and approve profiles, candidate registrations will list here.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'company' && profile && (
          <motion.div
            key="company-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs"
          >
            <h3 className="font-display font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-6">Manage Company Profile</h3>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    placeholder="e.g. Supabase Devs"
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Corporate Head Office Location
                  </label>
                  <input
                    type="text"
                    required
                    value={compLoc}
                    onChange={(e) => setCompLoc(e.target.value)}
                    placeholder="e.g. Bangalore (Remote)"
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Careers Page Website
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="url"
                    required
                    value={compWeb}
                    onChange={(e) => setCompWeb(e.target.value)}
                    placeholder="https://company.com"
                    className="w-full pl-10 pr-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  About the Corporation
                </label>
                <textarea
                  rows={5}
                  required
                  value={compDesc}
                  onChange={(e) => setCompDesc(e.target.value)}
                  placeholder="Focus areas, values, employee benefits, and workspace culture..."
                  className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
                >
                  Save Corporate Overview
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Position modal: Create or Edit */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden p-6 relative h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setShowJobModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer px-2 border border-transparent rounded-full"
              >
                &times;
              </button>

              <div className="mb-5">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">corporate vacancy system</span>
                <h3 className="text-xl font-display font-bold text-slate-900 mt-0.5">
                  {editingJob ? `Modify Position: ${editingJob.title}` : 'Launch New Vacancy Posting'}
                </h3>
              </div>

              <form onSubmit={handleJobSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Position Title / Role Heading
                  </label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Commitment Model
                    </label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value as JobType)}
                      className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Experience Tier
                    </label>
                    <select
                      value={jobLevel}
                      onChange={(e) => setJobLevel(e.target.value as ExperienceLevel)}
                      className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    >
                      <option value="Entry">Entry (Intern / Associate)</option>
                      <option value="Mid">Mid Level (2+ yrs)</option>
                      <option value="Senior">Senior Level (5+ yrs)</option>
                      <option value="Lead">Lead Accountant / Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Office / Work Location
                    </label>
                    <input
                      type="text"
                      required
                      value={jobLoc}
                      onChange={(e) => setJobLoc(e.target.value)}
                      placeholder="e.g. Hyderabad, TS"
                      className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Min Annual Budget (INR/yr)
                    </label>
                    <input
                      type="number"
                      required
                      min="100000"
                      step="50000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Max Annual Budget (INR/yr)
                    </label>
                    <input
                      type="number"
                      required
                      min="200000"
                      step="50000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Skills Required (Comma separated for Search algorithm matchmaking)
                  </label>
                  <input
                    type="text"
                    required
                    value={jobSkillsRaw}
                    onChange={(e) => setJobSkillsRaw(e.target.value)}
                    placeholder="e.g. React, TypeScript, SQL, Node.js"
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Key Education Requirements (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={jobRequirementsRaw}
                    onChange={(e) => setJobRequirementsRaw(e.target.value)}
                    placeholder="B.Tech Computer Science, 2+ yrs frontend, excellent communication..."
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Description & Qualifications list
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    placeholder="Outline day-to-day work, required tech stacks, perks, and how of the vetting process..."
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowJobModal(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Close Dialog
                  </button>
                  <button
                    type="submit"
                    className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow"
                  >
                    Save Posting
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Up Applicant Evaluation Screen */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white border border-slate-200 w-full max-w-xl rounded-2xl shadow-xl overflow-hidden p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer border border-transparent rounded-full px-2"
              >
                &times;
              </button>

              <div className="mb-5 border-b border-slate-100 pb-3">
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Candidate Evaluation System</span>
                <h3 className="text-xl font-display font-bold text-slate-900 mt-1">{selectedApp.seekerName}</h3>
                <p className="text-slate-500 text-xs font-semibold">{selectedApp.seekerTitle} &bull; {selectedApp.seekerEmail}</p>
              </div>

              {/* PDF Content simulation */}
              <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200/50 space-y-2 mb-5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-4.5 h-4.5 text-blue-600" />
                  Attached Document: {selectedApp.resumeName}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-white/85 p-3 rounded-xl border border-slate-100 italic">
                  {selectedApp.resumeContent || 'N/A Academic indices preseed'}
                </p>
                <button
                  type="button"
                  onClick={() => alert(`Downloaded file: "${selectedApp.resumeName}"`)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-bold text-slate-700 rounded-lg inline-flex items-center gap-1 cursor-pointer shadow-xs transition-colors"
                >
                  Download Complete PDF Resume
                </button>
              </div>

              {selectedApp.coverLetter && (
                <div className="mb-5 text-xs text-slate-600">
                  <span className="font-bold text-slate-700 block mb-1">Cover statement letter:</span>
                  <p className="bg-slate-50 p-3.5 rounded-xl whitespace-pre-line italic">"{selectedApp.coverLetter}"</p>
                </div>
              )}

              {/* Status workflow transitions */}
              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Evaluation Note / Message to Candidate
                  </label>
                  <textarea
                    rows={2}
                    value={statusChangeNote}
                    onChange={(e) => setStatusChangeNote(e.target.value)}
                    placeholder="Include dynamic interview info or rejection explanation notes..."
                    className="w-full p-2.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-brand-600"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Transition Workflow status:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleUpdateStatusSubmit(e, 'Shortlisted')}
                      className="px-3 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Shortlist ✓
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleUpdateStatusSubmit(e, 'Interviewing')}
                      className="px-3 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold rounded-lg cursor-pointer transition-all"
                    >
                      Interview...
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleUpdateStatusSubmit(e, 'Offered')}
                      className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Offer Job!
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleUpdateStatusSubmit(e, 'Rejected')}
                      className="px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                    >
                      Reject Candidate
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
