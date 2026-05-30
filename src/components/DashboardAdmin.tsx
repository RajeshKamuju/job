import React, { useState, useEffect } from 'react';
import { User, RecruiterProfile, Job, Application, SystemLog, PortalDB } from '../data';
import { 
  ShieldAlert, Users, Briefcase, FileClock, CheckCircle2, UserX, Trash2, 
  Search, Flag, ShieldCheck, HelpCircle, HardDrive, Filter, Activity, ServerCrash, RefreshCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardAdminProps {
  userId: string;
  onLogout: () => void;
}

export default function DashboardAdmin({ userId, onLogout }: DashboardAdminProps) {
  // DB States
  const [users, setUsers] = useState<User[]>([]);
  const [recruiters, setRecruiters] = useState<RecruiterProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);

  // Sub navigation tabs
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'recruiters' | 'jobs' | 'logs'>('analytics');

  // Search parameters
  const [userQuery, setUserQuery] = useState('');
  const [recQuery, setRecQuery] = useState('');
  const [jobQuery, setJobQuery] = useState('');
  
  // Notification banner
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setUsers(PortalDB.getUsers());
    setRecruiters(PortalDB.getRecruiters());
    setJobs(PortalDB.getJobs());
    setApplications(PortalDB.getApplications());
    setLogs(PortalDB.getLogs());
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Recruiter approval toggle
  const handleApproveRecruiter = (id: string, approve: boolean) => {
    const success = PortalDB.approveRecruiter(id, approve, 'admin@jobportal.com');
    if (success) {
      showNotification('success', approve ? 'Recruiter verified!' : 'Recruiter verification revoked.');
      loadData();
    }
  };

  // Block user toggle
  const handleBlockUser = (id: string, block: boolean) => {
    const success = PortalDB.blockUser(id, block, 'admin@jobportal.com');
    if (success) {
      showNotification('success', block ? 'User blocked from platform authentication.' : 'User restored successfully.');
      loadData();
    }
  };

  // Delete user
  const handleDeleteUser = (id: string) => {
    if (confirm('Are you serious? Deleting a user profile removes their details completely from the platform.')) {
      PortalDB.deleteUser(id, 'admin@jobportal.com');
      showNotification('success', 'User completely purged from the registry.');
      loadData();
    }
  };

  // Flag/remove suspicious jobs
  const handleFlagJob = (id: string, status: 'active' | 'flagged' | 'closed') => {
    const success = PortalDB.flagJob(id, status, 'admin@jobportal.com');
    if (success) {
      showNotification('success', `Job vacancy status flagged to: ${status}`);
      loadData();
    }
  };

  const handleDeleteJob = (id: string) => {
    if (confirm('Confirm deleting this job vacancy completely? This action is absolute.')) {
      PortalDB.deleteJob(id, 'admin@jobportal.com');
      showNotification('success', 'Vacancy completely moderated and deleted.');
      loadData();
    }
  };

  // Seeker/Recruiter Filter queries
  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(userQuery.toLowerCase())
  );

  const filteredRecruiters = recruiters.filter(r => 
    r.companyName.toLowerCase().includes(recQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(recQuery.toLowerCase()) ||
    r.location.toLowerCase().includes(recQuery.toLowerCase())
  );

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(jobQuery.toLowerCase()) ||
    j.companyName.toLowerCase().includes(jobQuery.toLowerCase()) ||
    j.status.toLowerCase().includes(jobQuery.toLowerCase())
  );

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
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Title Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-rose-600 text-xs font-bold uppercase tracking-wider">System Administration</span>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mt-1">Platform Control Room</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor operational metrics, approve employer licenses, and moderate vacancies across India.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { loadData(); showNotification('success', 'Admin databases re-indexed successfully.'); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors"
            title="Re-fetch operational statistics"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <div className="bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            Vigilance System Active
          </div>
        </div>
      </div>

      {/* Statistics board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Registrations</p>
          <h3 className="text-3xl font-display font-bold text-slate-800 mt-1.5">{users.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Seekers, Employers & Admins</p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Recruiter Vets</p>
          <h3 className="text-3xl font-display font-bold text-slate-800 mt-1.5">
            {recruiters.filter(r => r.approved).length}
          </h3>
          <p className="text-[11px] text-amber-600 font-bold mt-1">
            &#x25cf; {recruiters.filter(r => !r.approved).length} require onboarding approval
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Job Vacancies Managed</p>
          <h3 className="text-3xl font-display font-bold text-slate-800 mt-1.5">{jobs.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {jobs.filter(j => j.status === 'flagged').length} flagged as suspicious
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Applications</p>
          <h3 className="text-3xl font-display font-bold text-slate-800 mt-1.5">{applications.length}</h3>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            ₹ Budget range: ₹6L - 90L/yr
          </p>
        </div>
      </div>

      {/* Admin subtabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 mb-8" id="admin_tabs">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Activity className="w-4 h-4" />
          Analytics & Metrics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4 h-4" />
          User Registry ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('recruiters')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'recruiters'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Employer Vetting ({recruiters.filter(r => !r.approved).length} Pending)
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Listing Moderator
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileClock className="w-4 h-4" />
          Audit Trails
        </button>
      </div>

      {/* Tab Panels */}
      <AnimatePresence mode="wait">
        {activeTab === 'analytics' && (
          <motion.div
            key="analytical-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* SVG Data Charts */}
            <div className="lg:col-span-8 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-6">
              <div>
                <h3 className="font-display font-semibold text-slate-900 text-lg">Activity Distribution Volume</h3>
                <p className="text-xs text-slate-400 mt-0.5">Platform application transmission count compared with launched openings.</p>
              </div>

              {/* High fidelity custom SVG Area graph */}
              <div className="w-full h-64 bg-slate-50 rounded-2xl border border-slate-100 p-4 relative flex flex-col justify-between">
                {/* Y Axis Guide Lines */}
                <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                  <div className="border-b border-slate-400 w-full" />
                </div>

                {/* SVG Curves */}
                <div className="flex-1 w-full relative">
                  <svg className="w-full h-full" viewBox="0 0 500 200" preserveAspectRatio="none">
                    {/* Background Areas */}
                    <path
                      d="M 10 200 Q 125 150 250 80 T 490 20 L 490 200 Z"
                      fill="url(#grad-blue)"
                      opacity="0.15"
                    />
                    <path
                      d="M 10 200 Q 125 170 250 120 T 490 70 L 490 200 Z"
                      fill="url(#grad-purple)"
                      opacity="0.1"
                    />

                    {/* Gradient Definitions */}
                    <defs>
                      <linearGradient id="grad-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#0284c7" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                      <linearGradient id="grad-purple" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                    </defs>

                    {/* Lines Chart */}
                    <path
                      d="M 10 200 Q 125 150 250 80 T 490 20"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />
                    <path
                      d="M 10 200 Q 125 170 250 120 T 490 70"
                      fill="none"
                      stroke="#a855f7"
                      strokeWidth="2"
                    />

                    {/* Nodes interactive dots */}
                    <circle cx="250" cy="80" r="5" fill="#024e8a" />
                    <circle cx="490" cy="20" r="5" fill="#024e8a" />
                    <circle cx="250" cy="120" r="4" fill="#6d28d9" />
                  </svg>
                </div>

                {/* Timeline indices legends */}
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-2 pr-2">
                  <span>Week 1 (May 10)</span>
                  <span>Week 2 (May 17)</span>
                  <span>Week 3 (May 24)</span>
                  <span>Present (May 30)</span>
                </div>
              </div>

              {/* Legends details */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-brand-600 rounded-full" />
                  <div>
                    <p className="font-semibold text-slate-800">Job seeker applications submitted (Global)</p>
                    <p className="text-slate-400 text-[11px]">Cumulative matched candidate metrics index.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full" />
                  <div>
                    <p className="font-semibold text-slate-800">Open active listings posted (Approved)</p>
                    <p className="text-slate-400 text-[11px]">Corporate positions offered across systems.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Health Block */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-6">
              <h4 className="font-display font-semibold text-slate-900">System Safety & Security Checklist</h4>

              {/* List of system statuses */}
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">RECRUITER VETTING QUEUE</span>
                    <span className="text-amber-600 font-bold uppercase">
                      {recruiters.filter(r => !r.approved).length} Pending
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full transition-all" 
                      style={{ width: `${(recruiters.filter(r => !r.approved).length / recruiters.length) * 100 || 0}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-600">SUSPICIOUS ADS RATE</span>
                    <span className="text-rose-600 font-bold">
                      {((jobs.filter(j => j.status === 'flagged').length / jobs.length) * 100 || 0).toFixed(0)}% Flagged
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-rose-500 h-full transition-all" 
                      style={{ width: `${(jobs.filter(j => j.status === 'flagged').length / jobs.length) * 100 || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Quick Tips */}
              <div className="p-4.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-2xl text-xs space-y-2">
                <p className="font-bold uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-4.5 h-4.5" />
                  Admin Directives
                </p>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-600">
                  <li>Always verify company websites prior to vetting approvals under <strong>Employer Vetting</strong>.</li>
                  <li>Moderate listings immediately if reports flag keywords like <em>Deposit cash, WhatsApp to hire</em>.</li>
                  <li>System auditing captures email identity, event, and database CRUD.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            key="users-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Search inputs bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={userQuery}
                placeholder="Search user registry by name, email, role..."
                onChange={(e) => setUserQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Users grid table */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Full Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Account Type</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4">Status / Auth</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-4 font-semibold text-slate-900">{user.fullName}</td>
                        <td className="p-4 font-mono text-slate-600">{user.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                            user.role === 'admin' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            user.role === 'recruiter' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 font-mono">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            user.blocked 
                              ? 'bg-red-50 text-red-700 border border-red-200 font-bold' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {user.blocked ? '✓ Blocked' : '● Allowed'}
                          </span>
                        </td>
                        <td className="p-4 text-right gap-2 space-x-1.5 whitespace-nowrap">
                          {user.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleBlockUser(user.id, !user.blocked)}
                                className={`px-2.5 py-1 text-[10px] font-semibold border rounded cursor-pointer transition-colors ${
                                  user.blocked 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100' 
                                    : 'bg-red-50 border-red-100 text-red-800 hover:bg-red-100'
                                }`}
                              >
                                {user.blocked ? 'Unblock' : 'Block Auth'}
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1 border border-slate-100 hover:border-red-200 text-red-500 rounded hover:bg-slate-50 cursor-pointer transition-colors"
                                title="Purge user record"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                          No users found matching parameters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'recruiters' && (
          <motion.div
            key="recruiters-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={recQuery}
                placeholder="Search recruiter profile registry by company, head office, email..."
                onChange={(e) => setRecQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Recruiters list */}
            <div className="space-y-4">
              {filteredRecruiters.map((rec) => (
                <div key={rec.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-semibold text-slate-900">{rec.companyName}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        rec.approved ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                      }`}>
                        {rec.approved ? 'Verified' : 'Pending Vet'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5">
                      <span>Office: {rec.location}</span>
                      <span>Website: <a href={rec.website} target="_blank" className="text-brand-600 hover:underline">{rec.website}</a></span>
                    </div>
                    <p className="text-slate-500 text-xs mt-2 italic">"{rec.description}"</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rec.approved ? (
                      <button
                        onClick={() => handleApproveRecruiter(rec.id, false)}
                        className="px-3.5 py-1.5 bg-rose-50 text-rose-700 border border-rose-200/50 rounded-xl text-xs font-bold cursor-pointer hover:bg-rose-100"
                      >
                        Suspend License
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproveRecruiter(rec.id, true)}
                        className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-emerald-700 shadow-sm"
                      >
                        Approve & Verify
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredRecruiters.length === 0 && (
                <div className="bg-white border border-slate-250 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  No verified or pending companies matching parameters.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'jobs' && (
          <motion.div
            key="jobs-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            {/* Search moderated vacancy */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={jobQuery}
                placeholder="Search platform vacancy listings (e.g. 'Suspect', 'Cryptolink')..."
                onChange={(e) => setJobQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 transition-all text-slate-800 font-medium"
              />
            </div>

            {/* Jobs listings table */}
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <div key={job.id} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display font-semibold text-slate-950 text-md">{job.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          job.status === 'flagged' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs font-semibold mt-0.5">{job.companyName} &bull; {job.location}</p>
                      
                      <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-500 mt-2 italic">
                        "{job.description}"
                      </div>
                    </div>

                    <div className="flex items-center gap-2 whitespace-nowrap">
                      {job.status === 'flagged' ? (
                        <button
                          onClick={() => handleFlagJob(job.id, 'active')}
                          className="px-2.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Clear Flag
                        </button>
                      ) : (
                        <button
                          onClick={() => handleFlagJob(job.id, 'flagged')}
                          className="px-2.5 py-1.5 border border-rose-250/60 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg cursor-pointer"
                        >
                          Flag Fake ad
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 text-red-500 border border-slate-100 hover:border-red-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                        title="Moderate Delete completely"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredJobs.length === 0 && (
                <div className="bg-white border border-slate-100 p-8 rounded-2xl text-center text-slate-400 text-xs">
                  No moderated positions matched.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            key="logs-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.15 }}
            className="space-y-4"
          >
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-400 uppercase tracking-wide">
                Security & Action Audit Logs
              </div>

              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/20 text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-slate-900 border border-slate-250/20 px-2 py-0.5 bg-slate-50 rounded">
                        {log.action}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1">{log.details}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Actor: {log.userEmail}</p>
                  </div>
                ))}

                {logs.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    No platform logs present.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
