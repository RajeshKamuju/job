import React, { useState } from 'react';
import { User, PortalDB } from '../data';
import { User as UserIcon, Building2, ShieldAlert, LogIn, ArrowRight, UserPlus, FileText } from 'lucide-react';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'seeker' | 'recruiter' | 'admin'>('seeker');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleDemoLogin = (demoEmail: string) => {
    const users = PortalDB.getUsers();
    const found = users.find(u => u.email === demoEmail);
    if (found) {
      if (found.blocked) {
        setError('This user account has been blocked by the Administrator.');
        return;
      }
      onLoginSuccess(found);
    } else {
      setError('Demo user not found.');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || (isSignUp && !fullName)) {
      setError('Please fill in all required fields.');
      return;
    }

    const users = PortalDB.getUsers();

    if (isSignUp) {
      const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        setError('An account with this email already exists.');
        return;
      }

      const newUser = {
        id: 'user_' + Math.random().toString(36).substring(2, 11),
        email: email.toLowerCase(),
        fullName,
        role,
        createdAt: new Date().toISOString()
      };

      PortalDB.saveUser(newUser);
      setSuccess('Account registered successfully! You can now log in.');
      setIsSignUp(false);
      // Pre-fill
      setEmail(newUser.email);
    } else {
      const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (found) {
        if (found.blocked) {
          setError('This user account has been blocked by the Administrator.');
          return;
        }
        onLoginSuccess(found);
      } else {
        setError('Invalid credentials. Standard email search triggered (use demo accounts for quick testing).');
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 bg-slate-50 font-sans" id="auth_page">
      {/* Visual Welcome Board */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-brand-900 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
        
        <div className="z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2.5 bg-brand-600 rounded-xl text-white shadow-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">JobPulse</span>
          </div>
          
          <h1 className="text-4xl font-display font-semibold tracking-tight leading-tight mb-4">
            Simplify recruitment. Accelerate growth.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            The intelligent, multi-module gateway connecting top-tier talent, verified recruiters, and secure, auditable administration tools in one unified space.
          </p>
        </div>

        <div className="z-10 pt-10 border-t border-slate-800">
          <div className="grid grid-cols-3 gap-6 text-center text-sm">
            <div>
              <p className="font-display text-2xl font-bold text-brand-100">12,400+</p>
              <p className="text-slate-400 text-xs mt-1">Active Seekers</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-100">580+</p>
              <p className="text-slate-400 text-xs mt-1">Verified Co\'s</p>
            </div>
            <div>
              <p className="font-display text-2xl font-bold text-brand-100">99.4%</p>
              <p className="text-slate-400 text-xs mt-1">Match Accuracy</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main interactive form */}
      <div className="lg:col-span-7 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md bg-white border border-slate-200/80 p-8 rounded-2xl shadow-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-display font-semibold text-slate-900">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isSignUp ? 'Join JobPulse today as a seeker or employer.' : 'Sign in to access your customized dashboard.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl mb-6">
              {success}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-2 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Choose Your Role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('seeker')}
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        role === 'seeker'
                          ? 'border-brand-600 bg-brand-50/50 text-brand-700 ring-2 ring-brand-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <UserIcon className="w-4 h-4" />
                      Job Seeker / User
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('recruiter')}
                      className={`flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-medium cursor-pointer transition-all ${
                        role === 'recruiter'
                          ? 'border-brand-600 bg-brand-50/50 text-brand-700 ring-2 ring-brand-100'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      Employer / Recruiter
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert(`Forgot password flow is simulated: Use pre-authorized Demo Logins below for rapid authentication.`)}
                    className="text-xs text-brand-600 hover:underline hover:text-brand-700"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-600 focus:bg-white text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm mt-2"
            >
              {isSignUp ? 'Register Account' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center mt-6">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-slate-600 hover:text-slate-950 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isSignUp ? (
                <>
                  Already have an account? <span className="text-brand-600 font-semibold">Sign In</span>
                </>
              ) : (
                <>
                  Don\'t have an account yet? <span className="text-brand-600 font-semibold">Register for free</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Sandbox Demo Portals (CRITICAL for College reviews / Rapid testing) */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Sandbox Demo Logins
              </span>
              <span className="px-2 py-0.5 text-[9px] font-bold text-brand-600 bg-brand-50 border border-brand-100 rounded-full uppercase tracking-tight">
                One-Click Role Switching
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Seeker Demo Card */}
              <button
                type="button"
                onClick={() => handleDemoLogin('seeker@jobportal.com')}
                className="flex items-center justify-between p-3 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Job Seeker</p>
                    <p className="text-[10px] text-slate-500">Rahul Sharma • Hyderabad</p>
                  </div>
                </div>
                <span className="text-[10px] text-blue-600 group-hover:translate-x-1 transition-transform font-medium">
                  Login &rarr;
                </span>
              </button>

              {/* Recruiter / Co Demo Card */}
              <button
                type="button"
                onClick={() => handleDemoLogin('hr@google.com')}
                className="flex items-center justify-between p-3 border border-slate-200 hover:border-amber-300 hover:bg-amber-50/30 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Google India Recruiter</p>
                    <p className="text-[10px] text-slate-500">Manage Job Posts & applicants</p>
                  </div>
                </div>
                <span className="text-[10px] text-amber-600 group-hover:translate-x-1 transition-transform font-medium">
                  Login &rarr;
                </span>
              </button>

              {/* Admin Demo Card */}
              <button
                type="button"
                onClick={() => handleDemoLogin('admin@jobportal.com')}
                className="flex items-center justify-between p-3 border border-slate-200 hover:border-rose-300 hover:bg-rose-50/30 rounded-xl text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-800">System Administrator</p>
                    <p className="text-[10px] text-slate-500">Analytics, approval queues, system safety</p>
                  </div>
                </div>
                <span className="text-[10px] text-rose-600 group-hover:translate-x-1 transition-transform font-medium">
                  Login &rarr;
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
