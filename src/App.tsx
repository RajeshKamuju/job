import React, { useState, useEffect } from 'react';
import { PortalDB, User } from './data';
import AuthScreen from './components/AuthScreen';
import DashboardSeeker from './components/DashboardSeeker';
import DashboardRecruiter from './components/DashboardRecruiter';
import DashboardAdmin from './components/DashboardAdmin';
import { 
  Building2, Users, ShieldAlert, LogOut, RefreshCw, Briefcase, 
  HelpCircle, Sparkles, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [debugRole, setDebugRole] = useState<'seeker' | 'recruiter' | 'admin' | null>(null);

  // Initialize LocalStorage Database Seed
  useEffect(() => {
    PortalDB.initialize();
    
    // Check if there is an active session
    const savedSession = localStorage.getItem('jp_active_user');
    if (savedSession) {
      const parsedUser = JSON.parse(savedSession) as User;
      // Fetch latest db version in case they were blocked/deleted in another tab
      const upToDateUser = PortalDB.getUsers().find(u => u.id === parsedUser.id);
      if (upToDateUser && !upToDateUser.blocked) {
        setCurrentUser(upToDateUser);
        setDebugRole(upToDateUser.role);
      } else {
        localStorage.removeItem('jp_active_user');
      }
    }
  }, []);

  const handleLoginSuccess = (user: User) => {
    // Save to active session
    localStorage.setItem('jp_active_user', JSON.stringify(user));
    setCurrentUser(user);
    setDebugRole(user.role);
    PortalDB.addLog('User Authenticated', `Successfully logged into session as ${user.fullName}`, user.email);
  };

  const handleLogout = () => {
    if (currentUser) {
      PortalDB.addLog('User Disconnected', `Session ended for ${currentUser.fullName}`, currentUser.email);
    }
    localStorage.removeItem('jp_active_user');
    setCurrentUser(null);
    setDebugRole(null);
  };

  // Quick switch between modules without needing logout (Invaluable for College evaluations / rapid testing!)
  const handleRoleQuickSwitch = (role: 'seeker' | 'recruiter' | 'admin') => {
    const list = PortalDB.getUsers();
    let targetEmail = '';
    if (role === 'seeker') targetEmail = 'seeker@jobportal.com';
    else if (role === 'recruiter') targetEmail = 'hr@google.com';
    else if (role === 'admin') targetEmail = 'admin@jobportal.com';

    const matchUser = list.find(u => u.email === targetEmail);
    if (matchUser) {
      localStorage.setItem('jp_active_user', JSON.stringify(matchUser));
      setCurrentUser(matchUser);
      setDebugRole(role);
      PortalDB.addLog('Quick Session Switch', `Sandbox switcher redirected credentials to ${matchUser.fullName}`, 'system-sandbox');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans select-none text-slate-800">
      
      {/* If not logged in, render the Auth/Onboarding portal page */}
      {!currentUser ? (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          {/* Global Header Bar */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200/95 shadow-xs px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Logo and module title */}
            <div className="flex items-center justify-between w-full md:w-auto">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 rounded-xl text-white">
                  <Briefcase className="w-5 h-5 text-brand-100" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="font-display font-black tracking-tight text-lg text-slate-900">JobPulse</span>
                    <span className="px-1.5 py-0.5 text-[8px] font-black bg-brand-600 text-white rounded-md uppercase tracking-widest">v1.2</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Academic Project Engine</p>
                </div>
              </div>
            </div>

            {/* QUICK SANDBOX CONTROLLER (The game-changer for reviews/demos!) */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 bg-slate-100/80 p-1.5 border border-slate-200/50 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-yellow-500 animate-spin" style={{ animationDuration: '3s' }} />
                Sandbox switch:
              </span>
              
              <div className="flex p-0.5 bg-white border border-slate-200 shadow-3xs rounded-xl gap-0.5">
                <button
                  onClick={() => handleRoleQuickSwitch('seeker')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                    debugRole === 'seeker'
                      ? 'bg-blue-600 text-white shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Simulate job seeker workflow"
                >
                  Candidate
                </button>
                <button
                  onClick={() => handleRoleQuickSwitch('recruiter')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                    debugRole === 'recruiter'
                      ? 'bg-amber-500 text-slate-950 shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Simulate recruiter CRUD and pipeline"
                >
                  Employer
                </button>
                <button
                  onClick={() => handleRoleQuickSwitch('admin')}
                  className={`px-3 py-1 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                    debugRole === 'admin'
                      ? 'bg-rose-600 text-white shadow-3xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Simulate administrator control room"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Active profile badge + Exit button */}
            <div className="flex items-center gap-4 text-xs">
              <div className="hidden sm:flex flex-col items-end text-right leading-tight">
                <p className="font-bold text-slate-800">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 font-mono italic">{currentUser.email}</p>
              </div>

              {/* Profile icon */}
              <div className="w-8.5 h-8.5 bg-slate-100 text-slate-700 font-display font-semibold flex items-center justify-center rounded-xl border border-slate-200">
                {currentUser.fullName.charAt(0)}
              </div>

              {/* Exit out */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 hover:bg-slate-100 hover:text-red-600 text-slate-500 font-bold tracking-tight rounded-xl cursor-pointer transition-all shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </header>

          {/* Core Content Body according to user role */}
          <main className="flex-grow bg-slate-50">
            <AnimatePresence mode="wait">
              {debugRole === 'seeker' && (
                <motion.div
                  key="seeker"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DashboardSeeker userId={currentUser.id} onLogout={handleLogout} />
                </motion.div>
              )}

              {debugRole === 'recruiter' && (
                <motion.div
                  key="recruiter"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DashboardRecruiter userId={currentUser.id} onLogout={handleLogout} />
                </motion.div>
              )}

              {debugRole === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <DashboardAdmin userId={currentUser.id} onLogout={handleLogout} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Aesthetic Academic Footer */}
          <footer className="bg-white border-t border-slate-200/80 px-4 py-4 text-center text-xs text-slate-400">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <span className="font-medium">
                &copy; 2026 <strong>JobPulse Project Module</strong>. Structured for interview verification.
              </span>
              <div className="flex items-center gap-4 text-slate-400">
                <span>React 19</span>
                <span>Tailwind CSS v4</span>
                <span>Audit Safety System</span>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}
