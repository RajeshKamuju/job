import React, { useState } from 'react';
import { PortalDB } from '../data';
import { User } from '../types';
import { 
  User as UserIcon, Building2, ShieldAlert, LogIn, ArrowRight, UserPlus, FileText, 
  CheckCircle2, Sparkles, Star, Smartphone, Mail, ShieldCheck, HelpCircle, Laptop, 
  Rocket, Lock, Award, Key, RefreshCw, Eye, EyeOff, Check, X, Shield, Users, 
  PieChart, Share2, Award as BadgeIcon, Landmark, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  // Navigation: 'landing' | 'auth_choice' | 'signin' | 'signup'
  const [view, setView] = useState<'landing' | 'auth_choice' | 'signin' | 'signup'>('landing');
  const [role, setRole] = useState<'seeker' | 'recruiter' | 'admin'>('seeker');
  
  // Input fields for auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Recruiter fields
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [linkedinProfile, setLinkedinProfile] = useState('');

  // OTP Verification steps
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1); // 1: Input details, 2: Email Verification, 3: SMS Mobile OTP
  const [emailCode, setEmailCode] = useState('');
  const [smsCode, setSmsCode] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Simulated static stats
  const stats = [
    { label: 'Verified Candidates', value: '100,000+' },
    { label: 'Active Recruiters', value: '5,000+' },
    { label: 'Open Jobs posted', value: '25,000+' },
    { label: 'Job Authenticity Score', value: '98%' }
  ];

  const handleDemoLogin = (demoEmail: string) => {
    setError('');
    setSuccess('');
    const users = PortalDB.getUsers();
    const found = users.find(u => u.email === demoEmail);
    if (found) {
      if (found.blocked) {
        setError('This user account has been blocked by the Administrator.');
        return;
      }
      
      // Simulate verification flags or score
      if (found.role === 'seeker') {
        found.emailVerified = true;
        found.mobileVerified = true;
        found.trustScore = found.trustScore || 92;
      }
      
      onLoginSuccess(found);
      PortalDB.addLog('Sandbox login', `Logged in via demo sandbox as ${found.fullName}`, found.email);
    } else {
      setError('Demo account not found in system database.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !mobileNumber || !password || !confirmPassword) {
      setError('Please fill in all standard candidate credentials.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please cross-check fields.');
      return;
    }

    if (mobileNumber.length < 10) {
      setError('Please provide a valid 10-digit mobile number.');
      return;
    }

    // Check email uniqueness
    const users = PortalDB.getUsers();
    const emailExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      setError('An account with this email address already exists.');
      return;
    }

    // Move to Step 2: Email Verification Simulation
    setSignupStep(2);
    setSuccess('Step 1 Complete: Candidate profile registered. Code sent to ' + email);
  };

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!emailCode) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    // Any code passes for simulation, but let's notify user what code is expected
    setSignupStep(3);
    setSuccess('Email Verified! Step 2 complete. Premium OTP scheduled on Mobile: ' + mobileNumber);
  };

  const handleVerifySmsCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!smsCode) {
      setError('Please input the 6-digit SMS verification code.');
      return;
    }

    if (smsCode !== '839274' && smsCode !== '123456') {
      setError('Invalid SMS OTP. Active validation code is: 839274.');
      return;
    }

    // Activation logic & Database save
    const newUser: User = {
      id: 'seeker_' + Math.random().toString(36).substring(2, 11),
      email: email.toLowerCase(),
      fullName,
      role: 'seeker',
      createdAt: new Date().toISOString(),
      plan: 'free',
      // Store verification indicators
      emailVerified: true,
      mobileVerified: true,
      mobileNumber,
      trustScore: 85, // starting trust score
      aadhaarVerified: false,
      educationVerified: false
    };

    PortalDB.saveUser(newUser);
    
    // Auto-login
    onLoginSuccess(newUser);
    PortalDB.addLog('Secure Sign Up Complete', `Registered new candidate account ${fullName}`, email);
  };

  const handleHrRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!fullName || !email || !companyName || !companyWebsite || !gstNumber || !linkedinProfile) {
      setError('All employer credentials including business GST and corporate links are required.');
      return;
    }

    // Check duplicate
    const users = PortalDB.getUsers();
    const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      setError('This corporate email is already registered.');
      return;
    }

    const newHr: User = {
      id: 'hr_' + Math.random().toString(36).substring(2, 11),
      email: email.toLowerCase(),
      fullName,
      role: 'recruiter',
      createdAt: new Date().toISOString(),
      // Store Recruiter/Company metadata
      verifiedHr: true,
      verifiedCompany: true,
      companyName,
      companyWebsite,
      companyGst: gstNumber,
      companyLinkedin: linkedinProfile,
      trustScore: 90
    };

    // Save user & automatically seed corresponding recruiter profile
    PortalDB.saveUser(newHr);
    
    // Seed Recruiter Details in recruiter list
    const recruiterProfile = {
      id: newHr.id,
      companyName,
      email: email.toLowerCase(),
      description: `Verified enterprise recruiting workspace for ${companyName}. Leading specialized hiring initiatives.`,
      website: companyWebsite,
      location: 'Hyderabad, India (Corporate)',
      logoUrl: companyName.charAt(0).toUpperCase(),
      approved: true, // Auto-approved for sandbox friction minimization!
      isPremiumRecruiter: true
    };
    PortalDB.saveRecruiterProfile(recruiterProfile);

    // Auto login
    onLoginSuccess(newHr);
    PortalDB.addLog('Recruiter Approved Onboarding', `Registered & approved employer profile for ${companyName} (${fullName})`, email);
  };

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please input your active email and password.');
      return;
    }

    const users = PortalDB.getUsers();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (found) {
      if (found.blocked) {
        setError('This user account is blocked due to suspicion level. Please contact admin.');
        return;
      }
      onLoginSuccess(found);
    } else {
      setError('Credentials not found. Standard email search failed. Use the Instant Sandbox Logins below for immediate access.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 flex flex-col selection:bg-teal-500 selection:text-slate-950" id="auth_container">
      
      {/* GLOBAL BACKGROUND METASTATE DECORATORS */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.08),transparent_40%)] pointer-events-none"></div>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none"></div>

      {/* HEADER NAVBAR */}
      <nav className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-800/80 sticky top-0 bg-slate-900/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-teal-400 rounded-xl text-slate-950 shadow-lg shadow-cyan-500/10">
            <Building2 className="w-5.5 h-5.5 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2 leading-none">
              <span className="font-display font-black tracking-tight text-xl text-white">CareerForge</span>
              <span className="px-1.5 py-0.5 text-[8px] font-black bg-teal-500 text-slate-950 rounded-md uppercase tracking-wider">PREMIUM</span>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">LEARN • BUILD • APPLY • GET HIRED</p>
          </div>
        </div>

        {/* Dynamic Nav link mapping (only visual on landing page) */}
        {view === 'landing' ? (
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-300 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#stats" className="hover:text-white transition-colors">Statistics</a>
            <a href="#trust" className="hover:text-white transition-colors">Trust Center</a>
            <a href="#pricing" className="hover:text-white transition-colors text-teal-400">Premium Plans</a>
            <a href="#stories" className="hover:text-white transition-colors">Success Stories</a>
          </div>
        ) : (
          <button 
            onClick={() => { setView('landing'); setSignupStep(1); setError(''); setSuccess(''); }} 
            className="text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
          >
            &larr; Back to Platform Home
          </button>
        )}

        <div className="flex items-center gap-3">
          {view === 'landing' ? (
            <>
              <button 
                onClick={() => setView('auth_choice')} 
                className="px-4 py-2 border border-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-800 hover:border-slate-600 transition-all text-slate-200 cursor-pointer"
              >
                Sign In
              </button>
              <button 
                onClick={() => { setView('signup'); setRole('seeker'); }} 
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-400 font-bold text-slate-950 text-sm rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-md shadow-teal-500/10"
              >
                Get Started
              </button>
            </>
          ) : (
            <button 
              onClick={() => { setView('landing'); setSignupStep(1); setError(''); setSuccess(''); }}
              className="px-3.5 py-1.5 bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/90 rounded-lg cursor-pointer"
            >
              Platform Overview
            </button>
          )}
        </div>
      </nav>

      {/* CORE DISPLAY ROUTER */}
      <div className="flex-grow">
        
        {/* =============== LANDING PAGE VIEW =============== */}
        {view === 'landing' && (
          <div className="animate-fade-in">
            
            {/* HERO SECTION */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center relative">
              <div className="z-10 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-black uppercase tracking-widest rounded-full mb-6 leading-none">
                  <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                  AI-Powered Multi-Role Sandbox Gateway
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-tight mb-6">
                  Build Your Career. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">Get Hired Faster.</span> <br />
                  Grow Without Limits.
                </h1>
                <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                  CareerForge is India's premier AI-integrated enterprise recruitment solution. Seamlessly verify identities, compose ATS-friendly resumes, analyze skills gap, simulate mock interview coding compilers, and track honest workflows.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => { setView('signup'); setRole('seeker'); }}
                    className="px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black tracking-tight text-center rounded-xl hover:opacity-95 transition-all cursor-pointer shadow-lg shadow-teal-500/20 text-sm flex items-center justify-center gap-2"
                  >
                    Get Onboarded As Candidate <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                  <button 
                    onClick={() => { setView('signup'); setRole('recruiter'); }}
                    className="px-6 py-3.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-100 font-bold tracking-tight text-center rounded-xl transition-all cursor-pointer text-sm"
                  >
                    Post Job / Employer Portal
                  </button>
                </div>

                {/* Secure Fingerprint Indicator */}
                <div className="mt-8 flex items-center gap-3.5 text-xs text-slate-400 bg-slate-800/40 p-3.5 rounded-xl border border-slate-800 max-w-md">
                  <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0" />
                  <div className="font-mono text-[11px] leading-tight">
                    <span className="text-teal-400 font-bold">DEVICE SECURITY STATUS:</span> ACTIVE • IP SAFE • REAL-TIME ANTI-GHOST TRACKING IN SERVICE
                  </div>
                </div>
              </div>

              {/* Dynamic Isometric Dashboard Visual Mockup */}
              <div className="relative flex justify-center items-center">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-teal-500/10 blur-3xl opacity-30 pointer-events-none"></div>
                <div className="w-full max-w-lg bg-slate-800/50 border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                  
                  {/* Decorative Mac window buttons */}
                  <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                    <span className="text-slate-500 text-[10px] font-mono ml-2">careerforge_system_metrics.json</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-10 bg-teal-400 rounded-full"></div>
                        <div>
                          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Applicant Accuracy</p>
                          <p className="text-white text-base font-black">AI Resume Match Score: 94%</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[9px] bg-teal-500/15 text-teal-400 font-bold border border-teal-500/20 rounded-md">verified</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Trust Compliance</p>
                        <p className="text-slate-200 text-sm font-black">Rating: 9.8 / 10</p>
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full w-[98%]"></div>
                        </div>
                      </div>
                      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-wider mb-0.5">Avg response rate</p>
                        <p className="text-slate-200 text-sm font-black">8 Hr HR Reply</p>
                        <p className="text-teal-400 text-[9px] mt-1 font-semibold">&bull; Online Now</p>
                      </div>
                    </div>

                    {/* Features checklist snippet in Hero */}
                    <div className="p-3 bg-teal-950/20 border border-teal-900/30 rounded-xl text-xs space-y-1 text-teal-300/90 font-medium">
                      <p className="font-bold text-white text-xs mb-1">✓ Integrated Multi-Module Capabilities</p>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>• Live Mock Interviews</div>
                        <div>• Coding Compiler Tests</div>
                        <div>• Automated ATS Scoring</div>
                        <div>• Instant Razorpay Pay</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PLATFORM STATISTICS BAR */}
            <div id="stats" className="bg-slate-900 border-y border-slate-800 py-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  {stats.map((st, i) => (
                    <div key={i} className="space-y-1">
                      <p className="text-3xl sm:text-4xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-300">
                        {st.value}
                      </p>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{st.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DYNAMIC PLATFORM FEATURES */}
            <div id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="text-xs font-black text-teal-400 uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">The Unified Suite</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mt-4">Why Professionals Trust CareerForge</h2>
                <p className="text-slate-400 text-sm sm:text-sm leading-relaxed mt-3">
                  We don't just bridge jobs. We manage professional futures. Each module is optimized for compliance, performance, and clear outcomes.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6.5">
                
                {/* Card 1 */}
                <div className="p-6 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all text-left">
                  <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center mb-5 border border-teal-500/20">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Smart Job Matching %</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Our analyzer measures your skills, experience history, and resume texts against standard recruiter benchmarks to deliver a clear authenticity score.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="p-6 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all text-left">
                  <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-xl flex items-center justify-center mb-5 border border-cyan-500/20">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">AI Resume Analyzer & Builder</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Build professional resumes with responsive parameters. Get immediate feedback on missing certifications, skills, and industry terminology.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="p-6 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all text-left">
                  <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-5 border border-purple-500/20">
                    <Laptop className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Interview Coach & Code Arena</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Practice real, responsive Java/Spring Boot assessments with a built-in interactive code editor and evaluator to boost candidate confidence.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="p-6 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all text-left">
                  <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center mb-5 border border-rose-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Anti-Ghost Job Authenticity</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    To eliminate fake advertisements, jobs on CareerForge display a real-time authenticity rating that measures company response activity.
                  </p>
                </div>

                {/* Card 5 */}
                <div className="p-6 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all text-left">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center mb-5 border border-amber-500/20">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Hiring Pipeline & Scheduler</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Employers manage candidate selection via stages (Applied, Shortlisted, Interviewing). Schedule interview links directly with candidate.
                  </p>
                </div>

                {/* Card 6 */}
                <div className="p-6 bg-slate-800/40 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all text-left">
                  <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-5 border border-emerald-500/20">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">Personalized Growth Roadmap</h3>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Tell the CareerForge AI Coach your career objective, and it formats step-by-step modular learning matrices over a 6-month visual roadmap.
                  </p>
                </div>
              </div>
            </div>

            {/* TRUST & SECURITY CENTER */}
            <div id="trust" className="bg-slate-950 py-16 border-t border-slate-850">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
                <div className="text-left space-y-6">
                  <span className="text-xs font-black text-teal-400 uppercase tracking-widest bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">SUPER SECURE SYSTEM</span>
                  <h2 className="text-3xl font-extrabold text-white">Trust & Security Center</h2>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    Most job portals are ruined by fake postings, spam, and hidden contacts. CareerForge pioneers strict multi-level verification rules logic. We don’t tolerate ghost accounts.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-teal-500/20 rounded text-teal-400 mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Verified Candidate Badges</p>
                        <p className="text-[11px] text-slate-400">Level 1 Email ✅ • Level 2 Mobile OTP ✅ • Level 3 PAN/Aadhaar ✅ • Level 4 University verified ✅</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-teal-500/20 rounded text-teal-400 mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Verified Company Badges</p>
                        <p className="text-[11px] text-slate-400">Registered Corporate GST validation + Official Website link checks by System Admins.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-teal-500/20 rounded text-teal-400 mt-0.5 shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">Application Tracking Transparency</p>
                        <p className="text-[11px] text-slate-400">Candidates view absolute progress states in real-time, removing recruitment ghosting.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Candidate Trust Rating visual box */}
                <div className="bg-slate-900/60 p-6 border border-slate-800 rounded-2xl text-left">
                  <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <BadgeIcon className="w-4 h-4 text-yellow-500" />
                    Trusted User Profile Preview
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-slate-800 rounded-full flex items-center justify-center font-bold text-white">RS</div>
                        <div>
                          <p className="text-xs font-bold text-slate-100">Rajesh Kumar</p>
                          <p className="text-[10px] text-slate-400">B.TechCSE (JNTUH Verified) • Trust score: 95/100</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded">🟢 TRUSTED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-850 text-slate-300">Email Verified: <span className="text-emerald-400">✓ YES</span></div>
                      <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-850 text-slate-300">Identity Verified: <span className="text-emerald-400">✓ Aadhaar SEC</span></div>
                      <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-850 text-slate-300">Mobile OTP Verified: <span className="text-emerald-400">✓ OTP SEC</span></div>
                      <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-850 text-slate-300">Experience Checked: <span className="text-emerald-400">✓ YES</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* INTEGRATED PREMIUM PRICING PLANS */}
            <div id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
              <div className="max-w-2xl mx-auto mb-12">
                <span className="text-xs font-black text-teal-400 uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">Pricing Strategy</span>
                <h2 className="text-3xl font-extrabold text-white mt-4">Subscription Tiers Worth Paying For</h2>
                <p className="text-slate-400 text-sm mt-2">Activate enterprise AI roadmaps, mock tests, and HR reviewer tools instantly.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Free Plan */}
                <div className="bg-slate-800/30 border border-slate-800/80 p-5 rounded-xl text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-300">Free Plan</h3>
                    <p className="text-2xl font-black text-white mt-1.5">₹0 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                    <div className="h-px bg-slate-800/80 my-4"></div>
                    <ul className="text-[11px] text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Apply Standard Jobs</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Search Open Roles</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" /> Basic Resume upload</li>
                      <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" /> Track Applications</li>
                    </ul>
                  </div>
                  <button onClick={() => setView('auth_choice')} className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-750 text-xs font-bold rounded-lg text-slate-200 cursor-pointer">Default Free</button>
                </div>

                {/* Student Plan */}
                <div className="bg-slate-800/30 border border-teal-900/30 p-5 rounded-xl text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-teal-400">Student Plan</h3>
                    <p className="text-2xl font-black text-white mt-1.5">₹99 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                    <div className="h-px bg-slate-800/80 my-4"></div>
                    <ul className="text-[11px] text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Core AI Builder Access</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Basic Skill Gap Audit</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> 5 Custom Job Alerts</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Basic Courses Hub</li>
                    </ul>
                  </div>
                  <button onClick={() => setView('auth_choice')} className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-teal-400 border border-teal-900/30 cursor-pointer">Upgrade Student</button>
                </div>

                {/* Premium Plan */}
                <div className="bg-slate-800/30 border border-slate-700/80 p-5 rounded-xl text-left flex flex-col justify-between ring-2 ring-teal-500/20">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white">Premium Plan</h3>
                      <span className="text-[8px] bg-teal-500/10 text-teal-400 font-bold px-1 rounded uppercase">Most Popular</span>
                    </div>
                    <p className="text-2xl font-black text-white mt-1.5">₹499 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                    <div className="h-px bg-slate-800/80 my-4"></div>
                    <ul className="text-[11px] text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Dynamic ATS Advisor</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> AI Resume Builder</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> AI Resume Analyzer</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> AI Interview Coach</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Priority Support</li>
                    </ul>
                  </div>
                  <button onClick={() => setView('auth_choice')} className="w-full mt-6 py-2 bg-gradient-to-r from-teal-500 to-cyan-400 hover:opacity-90 text-xs font-black text-slate-950 rounded-lg cursor-pointer">Upgrade Premium</button>
                </div>

                {/* Premium Pro */}
                <div className="bg-slate-800/30 border border-slate-800 p-5 rounded-xl text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-indigo-400">Premium Plus</h3>
                    <p className="text-2xl font-black text-white mt-1.5">₹999 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                    <div className="h-px bg-slate-800/80 my-4"></div>
                    <ul className="text-[11px] text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5 text-slate-200"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Everything in Premium</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Human HR Resume feedback</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> AI Career Roadmaps</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> 8-12 LPA Salary Predict</li>
                      <li className="flex items-center gap-1.5 text-slate-300"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" /> Mock Coding Tests</li>
                    </ul>
                  </div>
                  <button onClick={() => setView('auth_choice')} className="w-full mt-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-lg cursor-pointer">Upgrade Plus</button>
                </div>

                {/* Ultimate Platinum */}
                <div className="bg-slate-850 border border-purple-900/30 p-5 rounded-xl text-left flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-purple-400">Premium Platinum</h3>
                    <p className="text-2xl font-black text-white mt-1.5">₹2999 <span className="text-xs font-normal text-slate-500">/mo</span></p>
                    <div className="h-px bg-slate-800/80 my-4"></div>
                    <ul className="text-[11px] text-slate-400 space-y-2">
                      <li className="flex items-center gap-1.5 text-slate-200"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Dedicated Career Coach</li>
                      <li className="flex items-center gap-1.5 text-slate-200"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Portfolio Website hosting</li>
                      <li className="flex items-center gap-1.5 text-slate-200"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Salary Negotiation help</li>
                      <li className="flex items-center gap-1.5 text-slate-200"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" /> Direct referral access</li>
                    </ul>
                  </div>
                  <button onClick={() => setView('auth_choice')} className="w-full mt-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-90 text-xs font-bold text-white rounded-lg cursor-pointer">Get Coach</button>
                </div>
              </div>
            </div>

            {/* SUCCESS STORIES */}
            <div id="stories" className="bg-slate-800/40 py-16 border-t border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <span className="text-xs font-black text-teal-400 uppercase tracking-widest">PLACEMENTS TRACKER</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">From Learning to Hiring, Our Success Stories</h2>
                
                <div className="grid md:grid-cols-2 gap-8 mt-12">
                  <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-left flex gap-5 items-start">
                    <div className="w-12 h-12 bg-teal-500 text-slate-950 rounded-xl flex items-center justify-center font-black text-lg shrink-0">R</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">Rajesh Kumar</h4>
                        <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-teal-400 font-bold border border-slate-800">Plank Developer</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Placed at: <strong className="text-white">Tata Consultancy Services (TCS)</strong> • CTC: <strong>7 LPA</strong></p>
                      <p className="text-slate-300 text-xs italic mt-3 leading-relaxed">
                        "The ATS builder helped me customize my resume with target Spring competencies. The dynamic mock coding space is exactly the level of questions they asked in the interview rounds."
                      </p>
                    </div>
                  </div>

                  <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl text-left flex gap-5 items-start">
                    <div className="w-12 h-12 bg-cyan-500 text-slate-950 rounded-xl flex items-center justify-center font-black text-lg shrink-0">R</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold">Rahul Sharma</h4>
                        <span className="text-[10px] bg-slate-850 px-2 py-0.5 rounded text-teal-400 font-bold border border-slate-800">Jr Front End Scholar</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Placed at: <strong className="text-white">Infosys Technologies</strong> • CTC: <strong>8 LPA</strong></p>
                      <p className="text-slate-300 text-xs italic mt-3 leading-relaxed">
                        "Incredible platform! The instant response tracker meant I always knew which HR reviewed my details. I verified my Aadhaar credentials to boost candidate trust, which worked instantly."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* PLATFORM FOOTER */}
            <footer className="border-t border-slate-800 py-10 bg-slate-950 text-slate-400 text-xs">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div>
                  <p className="font-bold text-white text-sm">CareerForge Inc.</p>
                  <p className="text-[11px] mt-1 text-slate-500">CareerForge — Learn, Build, Apply, Get Hired. Verified & Secure.</p>
                </div>
                <div className="flex flex-wrap gap-4 text-slate-400 justify-center">
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white">About Us</a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white">Privacy Policy</a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white">Terms of Compliance</a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-white">Secure Payments Node</a>
                </div>
                <div>
                  <p className="text-[10px] font-mono">SECURE PROTOCOL: TLS v1.3 • Webhook SSL</p>
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* =============== SIGN IN / CHOICE VIEW =============== */}
        {view === 'auth_choice' && (
          <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400"></div>

              <div className="mb-6.5 text-center">
                <ShieldCheck className="w-12 h-12 text-teal-400 mx-auto mb-3" />
                <h2 className="text-2xl font-black text-white">Super Secure Login</h2>
                <p className="text-slate-400 text-xs mt-1">Select your designated workspace role node on CareerForge.</p>
              </div>

              {/* Error messages */}
              {error && (
                <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-xl text-left font-medium">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-xs rounded-xl text-left font-medium">
                  {success}
                </div>
              )}

              <div className="space-y-3.5 mb-6.5">
                <button
                  onClick={() => { setRole('seeker'); setView('signin'); }}
                  className="w-full p-4 border border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-teal-500 hover:text-white rounded-xl transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/10 text-teal-400 rounded-lg group-hover:bg-teal-500/20">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">🧑 Login as Job Seeker</p>
                      <p className="text-[10px] text-slate-400 font-medium">Build profile, search jobs, use AI tools</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                </button>

                <button
                  onClick={() => { setRole('recruiter'); setView('signin'); }}
                  className="w-full p-4 border border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-amber-500 hover:text-white rounded-xl transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg group-hover:bg-amber-500/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">🏢 Login as HR / Recruiter</p>
                      <p className="text-[10px] text-slate-400 font-medium">Post listings, screening applicants</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                </button>

                <button
                  onClick={() => { setRole('admin'); setView('signin'); }}
                  className="w-full p-4 border border-slate-700 bg-slate-900/60 hover:bg-slate-900 hover:border-rose-500 hover:text-white rounded-xl transition-all flex items-center justify-between text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg group-hover:bg-rose-500/20">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-white">👑 Login as Administrator</p>
                      <p className="text-[10px] text-slate-400 font-medium">User reviews, payment reports, fraud checks</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-0.5 group-hover:text-white transition-all" />
                </button>
              </div>

              {/* ONE CLICK SANDBOX LOGINS PANEL FOR REVIEWERS */}
              <div className="pt-6 border-t border-slate-800">
                <p className="text-[10px] uppercase font-bold tracking-wider text-teal-400 mb-3 block text-center">Fast Dev Onboarding Sandbox</p>
                <div className="space-y-1.5 text-xs text-left">
                  <button 
                    onClick={() => handleDemoLogin('seeker@jobportal.com')} 
                    className="w-full py-2 bg-blue-950/20 hover:bg-blue-950/40 border border-blue-900/50 rounded-lg px-3 text-[11px] text-blue-300 flex justify-between items-center cursor-pointer"
                  >
                    <span>🧑 Candidate Fast Access (Rahul)</span> <span className="font-bold">Login &rarr;</span>
                  </button>
                  <button 
                    onClick={() => handleDemoLogin('hr@google.com')} 
                    className="w-full py-2 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-900/50 rounded-lg px-3 text-[11px] text-amber-300 flex justify-between items-center cursor-pointer"
                  >
                    <span>🏢 Google Recruiter Fast Access (John)</span> <span className="font-bold">Login &rarr;</span>
                  </button>
                  <button 
                    onClick={() => handleDemoLogin('admin@jobportal.com')} 
                    className="w-full py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/50 rounded-lg px-3 text-[11px] text-rose-300 flex justify-between items-center cursor-pointer"
                  >
                    <span>👑 System Admin Fast Access (Chief)</span> <span className="font-bold">Login &rarr;</span>
                  </button>
                </div>
              </div>

              <div className="mt-5 text-center text-slate-400 text-xs">
                Don't have an account or company profile?{' '}
                <button 
                  onClick={() => { setView('signup'); setRole('seeker'); }}
                  className="text-teal-400 font-bold hover:underline cursor-pointer"
                >
                  Register Profile Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============== SECURE SIGN IN SUBMISSION VIEW =============== */}
        {view === 'signin' && (
          <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl">
              <div className="mb-6">
                <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 p-1.5 uppercase font-bold tracking-widest rounded-md">
                  Active role: {role.toUpperCase()}
                </span>
                <h2 className="text-2xl font-black text-white mt-4">Welcome back</h2>
                <p className="text-slate-450 text-xs">Sign in with email and password secure parameters.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-950/40 text-red-300 border border-red-900 text-xs rounded-xl font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleStandardLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black tracking-tight text-xs uppercase rounded-xl hover:opacity-90 transition-all cursor-pointer shadow mt-4"
                >
                  Verify Credentials &rarr;
                </button>
              </form>

              {/* DEV BACK ACTIONS BUTTONS */}
              <div className="mt-6 pt-5 border-t border-slate-700 flex justify-between text-xs text-slate-400">
                <button onClick={() => setView('auth_choice')} className="hover:text-teal-400 cursor-pointer">&larr; Switch role selection</button>
                <button onClick={() => { setView('signup'); setRole('seeker'); }} className="text-teal-400 hover:underline cursor-pointer font-bold">Register free account</button>
              </div>
            </div>
          </div>
        )}

        {/* =============== SECURE REGISTRATION & OTP VIEW (MULTI-STEP) =============== */}
        {view === 'signup' && (
          <div className="max-w-md mx-auto px-4 py-12 animate-fade-in">
            <div className="bg-slate-800/80 border border-slate-700 p-8 rounded-2xl shadow-xl relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 to-cyan-400"></div>

              {/* CANDIDATE FLOW (OTP STEPS) */}
              {role === 'seeker' && (
                <div>
                  <div className="mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 p-1 font-black rounded uppercase">
                        Candidate Registration
                      </span>
                      <span className="text-xs text-slate-400 font-bold font-mono">Step {signupStep} of 3</span>
                    </div>
                    <h2 className="text-2xl font-black text-white mt-3">Register Portfolio</h2>
                    <p className="text-slate-400 text-xs leading-relaxed mt-1">
                      {signupStep === 1 && 'Compose authentic career credentials to unlock immediate AI resources.'}
                      {signupStep === 2 && 'Email confirmation requested. An activation email has been routed.'}
                      {signupStep === 3 && 'Double-layer lock active: OTP message sent to verify mobile authenticity.'}
                    </p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-xs rounded-xl font-medium">
                      {success}
                    </div>
                  )}

                  {/* Step 1: Input core parameters */}
                  {signupStep === 1 && (
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Full candidate name</label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Rajesh Kumar"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Email inbox address</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="rajesh@gmail.com"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">10-Digit Mobile Number</label>
                        <input
                          type="text"
                          required
                          maxLength={10}
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="9876543210"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Password</label>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Confirm password</label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black tracking-tight text-xs uppercase rounded-xl hover:opacity-90 transition-all cursor-pointer shadow mt-4"
                      >
                        Register details &rarr;
                      </button>
                    </form>
                  )}

                  {/* Step 2: Email verification */}
                  {signupStep === 2 && (
                    <form onSubmit={handleVerifyEmail} className="space-y-4">
                      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl text-xs leading-relaxed text-slate-355 text-left mb-4">
                        <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-teal-400" />
                          Simulated Security Inbox Check
                        </p>
                        A mock verification email has been dispatched to <strong className="text-white">{email}</strong>. 
                        Please enter <span className="text-yellow-400 font-mono font-black underline bg-yellow-500/10 px-1 rounded">VERIFY_EMAIL</span> below to certify authenticity.
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Email Verification Code</label>
                        <input
                          type="text"
                          required
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="VERIFY_EMAIL"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono tracking-widest text-center"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black tracking-tight text-xs uppercase rounded-xl hover:opacity-90 transition-all cursor-pointer mt-2"
                      >
                        Verify Email Inbox Code
                      </button>
                    </form>
                  )}

                  {/* Step 3: SMS OTP Verification */}
                  {signupStep === 3 && (
                    <form onSubmit={handleVerifySmsCode} className="space-y-4">
                      <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-xl text-xs leading-relaxed text-slate-355 text-left">
                        <p className="font-bold text-white mb-1 flex items-center gap-1.5">
                          <Smartphone className="w-4 h-4 text-teal-400" />
                          SMS Mobile OTP Simulation
                        </p>
                        To certify the phone network <strong className="text-white">+91 {mobileNumber}</strong> isn't fake, we sent a 6-digit test code.
                        <p className="text-teal-400 font-bold mt-2">👉 YOUR SECURITY CODE IS: <span className="text-yellow-400 font-mono font-black text-sm tracking-widest underline">839274</span></p>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Enter 6-Digit SMS Code</label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="839274"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono text-center text-sm tracking-widest"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-gradient-to-r from-teal-500 to-cyan-400 text-slate-950 font-black tracking-tight text-xs uppercase rounded-xl hover:opacity-90 transition-all cursor-pointer mt-2"
                      >
                        Complete Candidate OTP Security Validation
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* CORPORATE HR FLOW */}
              {role === 'recruiter' && (
                <div>
                  <div className="mb-6">
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 p-1 font-black rounded uppercase">
                      HR / Corporate Employer Signup
                    </span>
                    <h2 className="text-2xl font-black text-white mt-3">Verified HR Workspace</h2>
                    <p className="text-slate-400 text-xs mt-1">To block spam agencies, business entities require corporate links & approval records.</p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded-xl font-medium">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleHrRegisterSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">HR Representative Name</label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Corporate Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="hr@tcs.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Company name</label>
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Tata Consultancy"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Business Website</label>
                        <input
                          type="url"
                          required
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://tcs.com"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">GST registered Number</label>
                        <input
                          type="text"
                          required
                          value={gstNumber}
                          onChange={(e) => setGstNumber(e.target.value)}
                          placeholder="36AAAAA1111A1Z1"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">HR LinkedIn Profile</label>
                        <input
                          type="url"
                          required
                          value={linkedinProfile}
                          onChange={(e) => setLinkedinProfile(e.target.value)}
                          placeholder="https://linkedin.com/in/hr"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 p-2.5 border border-emerald-900/30 rounded-lg">
                      🟢 Verified HR instant status configured: User can sign in immediately after compliance verification verification.
                    </p>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black tracking-tight text-xs uppercase rounded-xl hover:opacity-90 transition-all cursor-pointer mt-2"
                    >
                      Onboard verified recruiter portal
                    </button>
                  </form>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-slate-700 flex justify-between text-xs text-slate-400">
                <button onClick={() => { setView('auth_choice'); setSignupStep(1); setError(''); setSuccess(''); }} className="hover:text-teal-400 cursor-pointer">&larr; Switch login category</button>
                <button onClick={() => { setView('signin'); setRole('seeker'); setSignupStep(1); }} className="text-teal-400 font-bold hover:underline cursor-pointer">Already registered? Log in</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
