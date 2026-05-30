import React, { useState, useEffect } from 'react';
import { Job, Application, SavedJob, JobSeekerProfile, PortalDB, JobType, ExperienceLevel } from '../data';
import { 
  Briefcase, MapPin, Search, Filter, Bookmark, CheckCircle, RefreshCcw, LogOut, 
  User, Mail, Phone, Plus, Trash2, Calendar, FileText, ChevronRight, Send, HelpCircle, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardSeekerProps {
  userId: string;
  onLogout: () => void;
}

export default function DashboardSeeker({ userId, onLogout }: DashboardSeekerProps) {
  // Profiles & DB State
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  
  // Tab Controller
  const [activeTab, setActiveTab] = useState<'listings' | 'applications' | 'saved' | 'profile'>('listings');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [salaryMin, setSalaryMin] = useState<number>(0);
  const [selectedSkill, setSelectedSkill] = useState<string>('All');

  // App Modal states
  const [applyingJob, setApplyingJob] = useState<Job | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Profile Form state
  const [editTitle, setEditTitle] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [tempSkill, setTempSkill] = useState('');

  // Education Subform
  const [newSchool, setNewSchool] = useState('');
  const [newDegree, setNewDegree] = useState('');
  const [newField, setNewField] = useState('');
  const [newEdStart, setNewEdStart] = useState('');
  const [newEdEnd, setNewEdEnd] = useState('');
  
  // Experience Subform
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newExpStart, setNewExpStart] = useState('');
  const [newExpEnd, setNewExpEnd] = useState('');
  const [newExpCurrent, setNewExpCurrent] = useState(false);
  const [newExpDesc, setNewExpDesc] = useState('');

  // Load profile & listings data
  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = () => {
    const prof = PortalDB.getSeekerProfile(userId);
    setProfile(prof);
    
    // Default form pre-population
    if (prof) {
      setEditTitle(prof.title);
      setEditLocation(prof.location);
      setEditPhone(prof.phone);
      setEditBio(prof.bio);
      setUploadedFileName(prof.resumeName || '');
    }

    // Load jobs & other tables
    const allJobs = PortalDB.getJobs().filter(j => j.status === 'active');
    setJobs(allJobs);

    const apps = PortalDB.getApplications().filter(a => a.seekerId === userId);
    setApplications(apps);

    const saved = PortalDB.getSavedJobs(userId);
    setSavedJobs(saved);
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  // Job Filtering logic
  const filteredJobs = jobs.filter(job => {
    const matchesQuery = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesLocation = selectedLocation === '' || 
                            job.location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    const matchesType = selectedType === 'All' || job.type === selectedType;
    const matchesLevel = selectedLevel === 'All' || job.experienceLevel === selectedLevel;
    const matchesSalary = job.salaryMax >= salaryMin;
    const matchesSkill = selectedSkill === 'All' || job.skills.includes(selectedSkill);
    
    return matchesQuery && matchesLocation && matchesType && matchesLevel && matchesSalary && matchesSkill;
  });

  // Extract unique locations and skills for dropdown filters
  const uniqueLocations = Array.from(new Set(jobs.map(j => j.location.replace(/ \(.*?\)/g, '').trim())));
  const allAvailableSkills = Array.from(new Set(jobs.flatMap(j => j.skills)));

  // Save/Favorite toggler
  const handleToggleSave = (jobId: string) => {
    const flag = PortalDB.toggleSaveJob(userId, jobId);
    const updated = PortalDB.getSavedJobs(userId);
    setSavedJobs(updated);
    showNotification('success', flag ? 'Job saved to favorites!' : 'Job removed from favorites!');
  };

  // Drag and Drop simulation handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setUploadedFileName(file.name);
        showNotification('success', `PDF attached code: ${file.name}`);
      } else {
        showNotification('error', 'Only PDF formats are supported for automatic resume matching.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      showNotification('success', `Attached PDF: ${file.name}`);
    }
  };

  // Job application submission
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJob) return;

    if (!uploadedFileName) {
      showNotification('error', 'Please upload or select a resume (PDF) to proceed with recruitment.');
      return;
    }

    // Prevent duplicate applications
    const hasAppliedAlready = applications.some(a => a.jobId === applyingJob.id);
    if (hasAppliedAlready) {
      showNotification('error', 'You have already submitted an application for this vacancy.');
      setApplyingJob(null);
      return;
    }

    const appPayload = {
      jobId: applyingJob.id,
      seekerId: userId,
      seekerName: profile?.fullName || 'Rahul Sharma',
      seekerEmail: profile?.email || 'seeker@jobportal.com',
      seekerTitle: profile?.title || 'Full Stack Developer',
      resumeName: uploadedFileName,
      coverLetter,
      status: 'Applied' as const
    };

    PortalDB.applyForJob(appPayload);
    showNotification('success', `Your application for ${applyingJob.title} has been transmitted!`);
    
    // Updates
    setApplyingJob(null);
    setCoverLetter('');
    loadData();
  };

  // Profile Save Actions
  const handleSaveProfileBasic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updatedProfile: JobSeekerProfile = {
      ...profile,
      title: editTitle,
      location: editLocation,
      phone: editPhone,
      bio: editBio,
      resumeName: uploadedFileName
    };

    PortalDB.saveSeekerProfile(updatedProfile);
    setProfile(updatedProfile);
    showNotification('success', 'Profile information updated successfully!');
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !tempSkill.trim()) return;

    if (profile.skills.includes(tempSkill.trim())) {
      setTempSkill('');
      return;
    }

    const updatedSkills = [...profile.skills, tempSkill.trim()];
    const updated = { ...profile, skills: updatedSkills };
    PortalDB.saveSeekerProfile(updated);
    setProfile(updated);
    setTempSkill('');
    showNotification('success', `Added skill: ${tempSkill}`);
  };

  const handleRemoveSkill = (skill: string) => {
    if (!profile) return;
    const updatedSkills = profile.skills.filter(s => s !== skill);
    const updated = { ...profile, skills: updatedSkills };
    PortalDB.saveSeekerProfile(updated);
    setProfile(updated);
  };

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newSchool || !newDegree || !newField) return;

    const entry = {
      school: newSchool,
      degree: newDegree,
      field: newField,
      startYear: newEdStart || '2020',
      endYear: newEdEnd || 'Present'
    };

    const updated = { ...profile, education: [...profile.education, entry] };
    PortalDB.saveSeekerProfile(updated);
    setProfile(updated);

    // reset
    setNewSchool('');
    setNewDegree('');
    setNewField('');
    setNewEdStart('');
    setNewEdEnd('');
    showNotification('success', 'Education record appended!');
  };

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newCompany || !newRole) return;

    const entry = {
      company: newCompany,
      role: newRole,
      startDate: newExpStart || '2023-01',
      endDate: newExpCurrent ? 'Present' : (newExpEnd || '2024-01'),
      current: newExpCurrent,
      description: newExpDesc
    };

    const updated = { ...profile, experience: [...profile.experience, entry] };
    PortalDB.saveSeekerProfile(updated);
    setProfile(updated);

    // reset
    setNewCompany('');
    setNewRole('');
    setNewExpStart('');
    setNewExpEnd('');
    setNewExpCurrent(false);
    setNewExpDesc('');
    showNotification('success', 'Experience record appended!');
  };

  // AI Resume Match Score simulation matching seeker skills to job requirements
  const calculateMatchScore = (jobSkills: string[]) => {
    if (!profile || !profile.skills.length) return 20; // base score
    const matched = jobSkills.filter(s => 
      profile.skills.some(ps => ps.toLowerCase().includes(s.toLowerCase()))
    );
    const score = Math.round((matched.length / Math.max(jobSkills.length, 1)) * 80) + 20;
    return Math.min(score, 100);
  };

  // Recommended jobs are ones where seeker skills match at least 1 job skill
  const recommendedJobsCount = jobs.filter(j => 
    j.skills.some(s => profile?.skills.some(ps => ps.toLowerCase() === s.toLowerCase()))
  ).length;

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

      {/* Seeker Dashboard Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-brand-600 text-xs font-bold uppercase tracking-wider">Candidate Module</span>
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight mt-1">Hello, {profile?.fullName || 'Rahul'}</h1>
          <p className="text-slate-500 text-sm mt-1">Browse vacancy listings, track current application statuses, and build your digital cv.</p>
        </div>
        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => { loadData(); showNotification('success', 'Listings refreshed.'); }}
            className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 cursor-pointer shadow-xs transition-colors"
            title="Refresh positions"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <div className="px-3.5 py-1.5 bg-brand-50 border border-brand-100 rounded-xl text-xs font-semibold text-brand-700">
            {profile?.title || 'Full Stack Developer'}
          </div>
        </div>
      </div>

      {/* Metrics board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Positions</p>
          <h3 className="text-3xl font-display font-bold text-slate-800 mt-1.5">{jobs.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Live roles across India</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Applications Submitted</p>
          <h3 className="text-3xl font-display font-bold text-slate-800 mt-1.5">{applications.length}</h3>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">&#x25cf; {applications.filter(a => a.status !== 'Rejected').length} active pipeline</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bookmarks</p>
          <h3 className="text-3xl font-display font-bold text-slate-800 mt-1.5">{savedJobs.length}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Saved items for later review</p>
        </div>
        <div className="bg-white border border-slate-200/80 p-5 rounded-2xl shadow-xs bg-gradient-to-br from-brand-50/40 to-white">
          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest">Smart Matchings</p>
          <h3 className="text-3xl font-display font-bold text-brand-900 mt-1.5">{recommendedJobsCount}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Matches found for your skills</p>
        </div>
      </div>

      {/* Sub navigation bar */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-1 mb-8" id="seeker_tabs">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'listings'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Find Jobs
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'applications'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          My Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'saved'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          Saved Jobs ({savedJobs.length})
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 py-3 px-4 font-semibold text-sm border-b-2 cursor-pointer transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-brand-600 text-brand-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <User className="w-4 h-4" />
          My Profile & CV
        </button>
      </div>

      {/* Tab Area content details */}
      <AnimatePresence mode="wait">
        {activeTab === 'listings' && (
          <motion.div
            key="listings-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* Filter side block */}
            <div className="lg:col-span-4 bg-white border border-slate-200/80 p-6 rounded-2xl h-fit shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-600" />
                  <h4 className="font-display font-semibold text-slate-800">Advanced Filters</h4>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedLocation('');
                    setSelectedType('All');
                    setSelectedLevel('All');
                    setSalaryMin(0);
                    setSelectedSkill('All');
                    showNotification('success', 'Filters cleared');
                  }}
                  className="text-xs text-brand-600 hover:underline font-semibold cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              {/* Location Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                >
                  <option value="">Any Location (All India / Global)</option>
                  {uniqueLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {/* Skills select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Filter by Technology Focus
                </label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                >
                  <option value="All">All Technologies</option>
                  {allAvailableSkills.map(sk => (
                    <option key={sk} value={sk}>{sk}</option>
                  ))}
                </select>
              </div>

              {/* Job Type Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Commitment Model
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Full-time', 'Part-time', 'Contract', 'Remote'].map((typeOption) => (
                    <button
                      type="button"
                      key={typeOption}
                      onClick={() => setSelectedType(typeOption)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                        selectedType === typeOption
                          ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {typeOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Experience Level Select */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Experience Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['All', 'Entry', 'Mid', 'Senior', 'Lead'].map((lvlOption) => (
                    <button
                      type="button"
                      key={lvlOption}
                      onClick={() => setSelectedLevel(lvlOption)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border text-center cursor-pointer transition-all ${
                        selectedLevel === lvlOption
                          ? 'bg-brand-600 border-brand-600 text-white shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {lvlOption}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Salary Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Min Yearly Salary
                  </label>
                  <span className="text-xs font-semibold text-slate-900 font-mono">
                    ₹{(salaryMin / 100000).toFixed(1)}L
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="7000000"
                  step="200000"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(Number(e.target.value))}
                  className="w-full accent-brand-600 cursor-pointer h-2 bg-slate-100 rounded-lg"
                />
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                  <span>0L</span>
                  <span>35L</span>
                  <span>70L+</span>
                </div>
              </div>

              {/* Help box */}
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200/50">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-brand-600" />
                  College Interview Tip
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Toggle the <strong>Sandbox Demo Logins</strong> below or use the Admin panel to test employer verification approval queues dynamically!
                </p>
              </div>
            </div>

            {/* List side block */}
            <div className="lg:col-span-8 space-y-5">
              
              {/* Position keyword searching bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Query roles, technologies, or company names (e.g., 'React', 'Google')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl shadow-xs focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm placeholder-slate-400 text-slate-800 font-medium transition-all"
                />
              </div>

              {/* Filters applied info */}
              <div className="flex items-center justify-between text-xs text-slate-500 bg-white border border-slate-100 px-4 py-2.5 rounded-xl">
                <span>Displaying <strong>{filteredJobs.length} active vacancies</strong> matching parameters</span>
                {filteredJobs.length === 0 && (
                  <span className="text-red-500 font-semibold">Try reducing strict filters</span>
                )}
              </div>

              {/* Position list */}
              <div className="space-y-4">
                {filteredJobs.map((job) => {
                  const score = calculateMatchScore(job.skills);
                  const isSaved = savedJobs.some(s => s.jobId === job.id);
                  const hasApplied = applications.some(a => a.jobId === job.id);

                  return (
                    <motion.div
                      layout
                      key={job.id}
                      className="bg-white border border-slate-200 hover:border-slate-300 p-6 rounded-2xl shadow-xs transition-shadow duration-200"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          {/* Logo indicator */}
                          <div className="w-12 h-12 bg-slate-900 text-white font-display font-black flex items-center justify-center rounded-xl text-lg shadow-sm">
                            {job.companyLogo || job.companyName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-display font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-slate-600 text-sm font-medium mt-0.5">{job.companyName}</p>
                            
                            <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500 mt-2">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {job.location}
                              </span>
                              <span className="font-mono text-slate-900 font-semibold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                                ₹{(job.salaryMin / 100000).toFixed(1)}L - {(job.salaryMax / 100000).toFixed(1)}L/yr
                              </span>
                              <span className="px-2 py-0.5 bg-brand-50 border border-brand-100 rounded-full text-brand-700 font-semibold">
                                {job.type}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleSave(job.id)}
                            className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors"
                            title={isSaved ? 'Bookmarked' : 'Save position'}
                          >
                            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-amber-400 text-amber-500' : ''}`} />
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 line-clamp-3 mb-4 leading-relaxed whitespace-pre-line border-t border-slate-100 pt-3">
                        {job.description}
                      </div>

                      {/* Matching algorithm bar widget */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100 pt-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            AI Skills Match:
                          </span>
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${
                                score > 75 
                                  ? 'bg-emerald-600' 
                                  : score > 45 
                                    ? 'bg-amber-500' 
                                    : 'bg-rose-500'
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className={`text-[11px] font-mono font-bold ${
                            score > 75 
                              ? 'text-emerald-700 bg-emerald-50' 
                              : score > 45 
                                ? 'text-amber-700 bg-amber-50' 
                                : 'text-rose-700 bg-rose-50'
                          } px-1.5 py-0.5 rounded`}>
                            {score}%
                          </span>
                        </div>

                        {/* Apply button trigger */}
                        <button
                          type="button"
                          onClick={() => {
                            if (hasApplied) return;
                            setApplyingJob(job);
                          }}
                          disabled={hasApplied}
                          className={`px-4.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                            hasApplied 
                              ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-sm'
                          }`}
                        >
                          {hasApplied ? '✓ Applied already' : 'Quick Apply'}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}

                {filteredJobs.length === 0 && (
                  <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center">
                    <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-800 font-semibold">No active job opportunities found</p>
                    <p className="text-slate-400 text-xs mt-1">Try broadening your keywords or adjusting filters.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'applications' && (
          <motion.div
            key="applications-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {applications.map((app) => {
              const matchedJob = jobs.find(j => j.id === app.jobId) || {
                title: 'Senior Product Engineer',
                companyName: 'Suspended Recruiter Profile',
                location: 'N/A'
              };

              return (
                <div key={app.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                    <div>
                      <h4 className="font-display font-semibold text-slate-900 text-lg">{matchedJob.title}</h4>
                      <p className="text-slate-600 text-sm font-medium">{matchedJob.companyName} &bull; {matchedJob.location}</p>
                      <p className="text-xs text-slate-400 mt-1">Transmitted on {new Date(app.appliedAt).toLocaleDateString()}</p>
                    </div>

                    {/* Badge mapping */}
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                        app.status === 'Applied' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        app.status === 'Shortlisted' ? 'bg-purple-50 border-purple-200 text-purple-700 font-bold' :
                        app.status === 'Interviewing' ? 'font-mono bg-amber-50 border-amber-200 text-amber-700 font-bold animate-pulse' :
                        app.status === 'Offered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' :
                        'bg-slate-50 border-slate-200 text-slate-500'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  {app.coverLetter && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4 text-xs text-slate-600">
                      <p className="font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-500" />
                        Accompanying Notes:
                      </p>
                      <span className="whitespace-pre-line italic">"{app.coverLetter}"</span>
                    </div>
                  )}

                  {/* Activity History Logs */}
                  <div>
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                      Recruitment Trail
                    </h5>
                    <div className="space-y-3.5 pl-3 border-l-2 border-slate-100 ml-1.5">
                      {app.history.map((step, idx) => (
                        <div key={idx} className="relative text-xs">
                          {/* Circle node wrapper */}
                          <div className={`absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                            idx === 0 ? 'bg-brand-600 border-white ring-2 ring-brand-100' : 'bg-slate-200 border-white'
                          }`} />
                          
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <p className={`font-semibold ${idx === 0 ? 'text-slate-950 font-bold' : 'text-slate-500'}`}>
                                Transitioned to status: {step.status}
                              </p>
                              <p className="text-slate-500 mt-0.5">{step.note}</p>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(step.changedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}

            {applications.length === 0 && (
              <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center">
                <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-800 font-semibold">No applications transmitted yet</p>
                <p className="text-slate-400 text-xs mt-1">Look around for matching listings on the 'Find Jobs' board!</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'saved' && (
          <motion.div
            key="saved-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {savedJobs.map((sv) => {
              const job = jobs.find(j => j.id === sv.jobId);
              if (!job) return null;

              return (
                <div key={sv.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-display font-semibold text-slate-900">{job.title}</h4>
                    <p className="text-slate-600 text-sm font-medium">{job.companyName} &bull; {job.location}</p>
                    <p className="text-xs text-slate-400 mt-1">Favorited on {new Date(sv.savedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleSave(job.id)}
                      className="p-2.5 text-rose-500 hover:bg-rose-50 border border-slate-100 hover:border-rose-100 rounded-xl cursor-pointer transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={() => {
                        const already = applications.some(a => a.jobId === job.id);
                        if (already) {
                          showNotification('error', 'You already applied to this position.');
                        } else {
                          setApplyingJob(job);
                        }
                      }}
                      className="px-4 py-2 bg-slate-950 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors whitespace-nowrap"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              );
            })}

            {savedJobs.length === 0 && (
              <div className="bg-white border border-slate-200 p-12 rounded-2xl text-center">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-800 font-semibold">Your favorites board is empty</p>
                <p className="text-slate-400 text-xs mt-1">Bookmark vacancies to compile options before transmission.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && profile && (
          <motion.div
            key="profile-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.2 }}
            className="grid lg:grid-cols-12 gap-8"
          >
            {/* Left Col Profile Settings */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs space-y-6">
              <h3 className="font-display font-semibold text-slate-900 border-b border-slate-100 pb-3">Edit Profile Info</h3>
              
              <form onSubmit={handleSaveProfileBasic} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="e.g. Frontend Engineer"
                      className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Contact Location
                    </label>
                    <input
                      type="text"
                      value={editLocation}
                      placeholder="e.g. Bangalore, IN"
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editPhone}
                    placeholder="+91 99999 88888"
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Short Bio / Summary
                  </label>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Describe your goals, expertise, and technical accomplishments..."
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm"
                  />
                </div>

                {/* Simulated file upload wrapper inside editor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Resume Database File (PDF only)
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed p-6 rounded-2xl text-center cursor-pointer transition-all ${
                      dragActive ? 'border-brand-600 bg-brand-50/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="file"
                      id="seeker-resume-upload"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="seeker-resume-upload" className="cursor-pointer">
                      <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-800">
                        {uploadedFileName ? `Attached: ${uploadedFileName}` : 'Drag & drop your PDF CV here'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">or click to browse local folders</p>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Save Personal Summary
                </button>
              </form>
            </div>

            {/* Right Col Curriculum entries */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Technical skills tagging manager */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                <h4 className="font-display font-semibold text-slate-900 mb-3">Skills Dashboard</h4>
                
                <form onSubmit={handleAddSkill} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={tempSkill}
                    onChange={(e) => setTempSkill(e.target.value)}
                    placeholder="e.g. AWS, Django, Figma..."
                    className="flex-1 px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((sk) => (
                    <span 
                      key={sk}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200/60 rounded-xl text-xs font-medium"
                    >
                      {sk}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(sk)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer font-bold focus:outline-none"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                  {profile.skills.length === 0 && (
                    <span className="text-xs text-slate-400">No skills registered yet. Match index is 0.</span>
                  )}
                </div>
              </div>

              {/* Education appended forms */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                <h4 className="font-display font-semibold text-slate-900 mb-3">Academic Achievements</h4>
                
                {profile.education.map((ed, idx) => (
                  <div key={idx} className="border-b border-dashed border-slate-100 last:border-b-0 py-2.5 first:pt-0">
                    <p className="font-semibold text-slate-800 text-xs">{ed.degree} in {ed.field}</p>
                    <p className="text-slate-500 text-[11px]">{ed.school} &bull; {ed.startYear} - {ed.endYear}</p>
                  </div>
                ))}

                <form onSubmit={handleAddEducation} className="mt-4 border-t border-slate-100 pt-3.5 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Append Degree</p>
                  <input
                    type="text"
                    required
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    placeholder="University/School name"
                    className="w-full px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newDegree}
                      onChange={(e) => setNewDegree(e.target.value)}
                      placeholder="e.g. B.Tech"
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      required
                      value={newField}
                      onChange={(e) => setNewField(e.target.value)}
                      placeholder="e.g. Computer Science"
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newEdStart}
                      onChange={(e) => setNewEdStart(e.target.value)}
                      placeholder="Start year (e.g., 2020)"
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      value={newEdEnd}
                      onChange={(e) => setNewEdEnd(e.target.value)}
                      placeholder="End year (e.g., 2024)"
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Append Degree
                  </button>
                </form>
              </div>

              {/* Experience appended forms */}
              <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-xs">
                <h4 className="font-display font-semibold text-slate-900 mb-3">Employment History</h4>

                {profile.experience.map((ex, idx) => (
                  <div key={idx} className="border-b border-dashed border-slate-100 last:border-b-0 py-2.5 first:pt-0">
                    <p className="font-semibold text-slate-800 text-xs">{ex.role}</p>
                    <p className="text-slate-600 text-[11px]">{ex.company} &bull; {ex.startDate} - {ex.endDate}</p>
                    {ex.description && <p className="text-slate-400 text-[10px] leading-relaxed mt-1">{ex.description}</p>}
                  </div>
                ))}

                <form onSubmit={handleAddExperience} className="mt-4 border-t border-slate-100 pt-3.5 space-y-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Append Experience</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      placeholder="Company"
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      required
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      placeholder="e.g. Developer Intern"
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newExpStart}
                      onChange={(e) => setNewExpStart(e.target.value)}
                      placeholder="Start month (YYYY-MM)"
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                    <input
                      type="text"
                      disabled={newExpCurrent}
                      value={newExpEnd}
                      onChange={(e) => setNewExpEnd(e.target.value)}
                      placeholder={newExpCurrent ? 'Present' : 'End month (YYYY-MM)'}
                      className="px-3 py-1.5 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs disabled:opacity-50"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newExpCurrent}
                      onChange={(e) => setNewExpCurrent(e.target.checked)}
                      className="rounded accent-brand-600"
                    />
                    This is my current role
                  </label>
                  <textarea
                    rows={2}
                    value={newExpDesc}
                    onChange={(e) => setNewExpDesc(e.target.value)}
                    placeholder="Brief description of your daily responsibilities..."
                    className="w-full p-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Append Experience
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide-Up Application Modal */}
      <AnimatePresence>
        {applyingJob && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="bg-white border border-slate-200 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden p-6 relative"
            >
              <button 
                type="button"
                onClick={() => setApplyingJob(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer border border-transparent rounded-full px-2"
              >
                &times;
              </button>

              <div className="mb-5">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">vacant position transmission</span>
                <h3 className="text-lg font-display font-bold text-slate-900 mt-1">{applyingJob.title}</h3>
                <p className="text-slate-500 text-xs font-semibold">{applyingJob.companyName} &bull; {applyingJob.location}</p>
              </div>

              <form onSubmit={handleApplySubmit} className="space-y-4">
                {/* Simulated pdf attach selection inside submit form */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Resume Attachment (PDF CV required)
                  </label>
                  <div className="p-3 bg-brand-50/50 border border-brand-100 rounded-xl flex items-center justify-between text-xs text-brand-800">
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4.5 h-4.5 text-brand-600" />
                      {uploadedFileName ? (
                        <strong>{uploadedFileName}</strong>
                      ) : (
                        <span className="text-brand-500">No profile resume detected! Please upload below.</span>
                      )}
                    </span>
                    <label className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded cursor-pointer font-bold shrink-0 hover:bg-slate-50">
                      Choose
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Cover Letter or Direct Note (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Hello Hiring Manager, I am applying because..."
                    className="w-full px-3.5 py-2 text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1"
                  >
                    Transmit Application
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
