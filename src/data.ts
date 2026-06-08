import {
  User,
  JobSeekerProfile,
  RecruiterProfile,
  Job,
  Application,
  SavedJob,
  SystemLog,
  ApplicationStatus,
  JobType,
  ExperienceLevel,
  CompanyReview,
  ChatMessage,
  CustomFakeJobReport
} from './types';

export type {
  User,
  JobSeekerProfile,
  RecruiterProfile,
  Job,
  Application,
  SavedJob,
  SystemLog,
  ApplicationStatus,
  JobType,
  ExperienceLevel,
  CompanyReview,
  ChatMessage,
  CustomFakeJobReport
};

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Static Seed Data
export const INITIAL_USERS: User[] = [
  {
    id: 'user_seeker_1',
    email: 'seeker@jobportal.com',
    fullName: 'Rahul Sharma',
    role: 'seeker',
    createdAt: new Date(2026, 4, 1).toISOString()
  },
  {
    id: 'user_recruiter_1',
    email: 'hr@google.com',
    fullName: 'John Doe',
    role: 'recruiter',
    createdAt: new Date(2026, 4, 1).toISOString()
  },
  {
    id: 'user_recruiter_2',
    email: 'talent@supabase.io',
    fullName: 'Alice Johnson',
    role: 'recruiter',
    createdAt: new Date(2026, 4, 2).toISOString()
  },
  {
    id: 'user_admin_1',
    email: 'admin@jobportal.com',
    fullName: 'Chief Administrator',
    role: 'admin',
    createdAt: new Date(2026, 3, 10).toISOString()
  }
];

export const INITIAL_SEEKER_PROFILE: JobSeekerProfile = {
  id: 'user_seeker_1',
  fullName: 'Rahul Sharma',
  email: 'seeker@jobportal.com',
  title: 'Full Stack Developer',
  bio: 'Passionate software developer with 2+ years of experience building scalable web applications. Open source contributor and tech blogger.',
  location: 'Hyderabad, India (Open to Remote)',
  phone: '+91 98765 43210',
  skills: ['React', 'TypeScript', 'Node.js', 'Express', 'Tailwind CSS', 'SQL', 'MongoDB', 'Python'],
  education: [
    {
      school: 'IIT Hyderabad',
      degree: 'Bachelor of Technology',
      field: 'Computer Science and Engineering',
      startYear: '2020',
      endYear: '2024'
    }
  ],
  experience: [
    {
      company: 'Antigravity Technologies',
      role: 'Frontend Engineering Intern',
      startDate: '2023-06',
      endDate: '2023-12',
      current: false,
      description: 'Built beautiful responsive dashboards using React and Tailwind. Improved app performance by lazy-loading components.'
    },
    {
      company: 'Tech Solutions Inc',
      role: 'Associate Web Developer',
      startDate: '2024-01',
      endDate: 'Present',
      current: true,
      description: 'Developing full stack features for clients. Managing RESTful API development and MySQL database queries.'
    }
  ],
  resumeName: 'Rahul_Sharma_Resume.pdf',
  resumeUrl: '#',
  photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
};

export const INITIAL_RECRUITERS: RecruiterProfile[] = [
  {
    id: 'user_recruiter_1',
    companyName: 'Google India',
    email: 'hr@google.com',
    description: 'Our mission is to organize the world\'s information and make it universally accessible and useful. We build technology that connects people worldwide.',
    website: 'https://google.com/careers',
    location: 'Bangalore, Karnataka',
    logoUrl: 'G',
    approved: true
  },
  {
    id: 'user_recruiter_2',
    companyName: 'Supabase',
    email: 'talent@supabase.io',
    description: 'Supabase is an open source Firebase alternative. We are building the features of Firebase using enterprise-grade open source tools.',
    website: 'https://supabase.com',
    location: 'Remote (Singapore / US)',
    logoUrl: 'S',
    approved: false // Simulating recruiter approval queue for Admin module!
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_1',
    recruiterId: 'user_recruiter_1',
    companyName: 'Google India',
    companyLogo: 'G',
    title: 'Senior Frontend Architect',
    description: 'Join the Google Workspace team to design, develop, and deploy the next generation of collaborative web editors. Work on high-performance frameworks and lead engineering execution for high-traffic products.\n\n### Responsibilities\n- Architect robust, reusable frontend modules using modern frameworks.\n- Optimize app startup times, asset weight, and frame rates.\n- Mentor junior colleagues and conduct strict design reviews.\n\n### Core Qualities Sought\n- deep knowledge of JS compilers, AST transformations, and styling processors.\n- collaborative mindset and excellent communication.',
    requirements: ['React', 'TypeScript', 'Web Performance', 'AST', 'Webpack/Vite'],
    skills: ['React', 'TypeScript', 'Node.js', 'Vite'],
    location: 'Bangalore (Hybrid)',
    salaryMin: 3200000,
    salaryMax: 4800000,
    type: 'Full-time',
    experienceLevel: 'Senior',
    status: 'active',
    createdAt: new Date(2026, 4, 15).toISOString()
  },
  {
    id: 'job_2',
    recruiterId: 'user_recruiter_1',
    companyName: 'Google India',
    companyLogo: 'G',
    title: 'Staff Software Engineer, Google Cloud',
    description: 'As a Staff Engineer, you will shape the engineering roadmap of the Google Kubernetes Engine (GKE) console. Create accessible, ultra-fast web user interfaces that simplify modern microservice deployments for cloud administrators.\n\n### Requirements\n- Extensive background in microfrontend patterns.\n- Deep understanding of cloud computing systems.',
    requirements: ['Kubernetes', 'Cloud Console', 'Microfrontends', 'Angular/React'],
    skills: ['React', 'Docker', 'Kubernetes', 'TypeScript'],
    location: 'Hyderabad, Telangana',
    salaryMin: 4500000,
    salaryMax: 6500000,
    type: 'Full-time',
    experienceLevel: 'Lead',
    status: 'active',
    createdAt: new Date(2026, 4, 18).toISOString()
  },
  {
    id: 'job_3',
    recruiterId: 'user_recruiter_2',
    companyName: 'Supabase',
    companyLogo: 'S',
    title: 'Full-Stack Developer (Database Specialist)',
    description: 'Help us make PostgreSQL the developer-favorite database. You will build user interfaces, robust database clients, and real-time synchronization channels using Elixir, Node.js, and TypeScript.\n\n### Responsibilities\n- Design sleek, responsive database explorers.\n- Write efficient backend functions and manage indexing schemas.',
    requirements: ['TypeScript', 'PostgreSQL', 'Node.js', 'Tailwind CSS'],
    skills: ['TypeScript', 'Node.js', 'Tailwind CSS', 'SQL'],
    location: 'Fully Remote (Global)',
    salaryMin: 6000000,
    salaryMax: 9000000,
    type: 'Remote',
    experienceLevel: 'Mid',
    status: 'active',
    createdAt: new Date(2026, 4, 25).toISOString()
  },
  {
    id: 'job_4',
    recruiterId: 'user_recruiter_1',
    companyName: 'Google India',
    companyLogo: 'G',
    title: 'Frontend Intern - Google Commerce',
    description: 'Kickstart your career by working on Google Play Store checkout experiences. Collaborate directly with engineers, product managers, and designers to build responsive layouts and test user retention flows.',
    requirements: ['React Basics', 'HTML/CSS/JS', 'Problem Solving Skills'],
    skills: ['React', 'Tailwind CSS', 'HTML'],
    location: 'Bangalore, Karnataka',
    salaryMin: 600000,
    salaryMax: 800000,
    type: 'Internship',
    experienceLevel: 'Entry',
    status: 'active',
    createdAt: new Date(2026, 4, 28).toISOString()
  },
  {
    id: 'job_5',
    recruiterId: 'user_recruiter_2',
    companyName: 'Supabase',
    companyLogo: 'S',
    title: 'Developer Advocate',
    description: 'Create technical tutorials, record videos, and present at developer conferences worldwide. Champion the Postgres development environment and create strong integration blueprints in the community.',
    requirements: ['Content Creation', 'PostgreSQL', 'Developer Tooling Skills'],
    skills: ['React', 'TypeScript', 'SQL'],
    location: 'Remote (US/EU)',
    salaryMin: 5000000,
    salaryMax: 8000000,
    type: 'Remote',
    experienceLevel: 'Senior',
    status: 'active',
    createdAt: new Date(2026, 4, 29).toISOString()
  },
  {
    id: 'job_fake_6',
    recruiterId: 'stranger_danger',
    companyName: 'Suspect Cryptolink',
    companyLogo: 'C',
    title: 'Easy Cash Assistant (Earn $1000/hr)',
    description: 'Earn massive money from home doing nothing! Just click reviews and deposit security tokens. No skills required. Hurry up!',
    requirements: ['Deposit cash', 'WhatsApp access', 'Zero tech skills'],
    skills: ['None'],
    location: 'Unknown (Remote)',
    salaryMin: 120000000,
    salaryMax: 150000000,
    type: 'Remote',
    experienceLevel: 'Entry',
    status: 'active', // Admin can flag this or remove it as 'fake'!
    createdAt: new Date(2026, 4, 29).toISOString()
  }
];

export const INITIAL_SAVED: SavedJob[] = [
  {
    id: 'saved_1',
    seekerId: 'user_seeker_1',
    jobId: 'job_1',
    savedAt: new Date(2026, 4, 20).toISOString()
  }
];

export const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app_1',
    jobId: 'job_1',
    seekerId: 'user_seeker_1',
    seekerName: 'Rahul Sharma',
    seekerEmail: 'seeker@jobportal.com',
    seekerTitle: 'Full Stack Developer',
    resumeName: 'Rahul_Sharma_Resume.pdf',
    resumeContent: 'IIT Hyderabad Grad. Core skills: React, TypeScript, Node.js, Express, Tailwind. GPA: 8.9. Experience: Web developer intern at Antigravity Technologies (6 months).',
    coverLetter: 'Dear Hiring Team, I am super excited by the Frontend Architect opportunity. I love compiling performance optimizations and modern UI systems. Hope to make Google Workspace even faster!',
    status: 'Shortlisted',
    appliedAt: new Date(2026, 4, 20).toISOString(),
    history: [
      {
        status: 'Applied',
        changedAt: new Date(2026, 4, 20).toISOString(),
        note: 'Application submitted successfully.'
      },
      {
        status: 'Shortlisted',
        changedAt: new Date(2026, 4, 22).toISOString(),
        note: 'Your profile looks exceptionally strong. We will schedule technical rounds.'
      }
    ]
  },
  {
    id: 'app_2',
    jobId: 'job_4',
    seekerId: 'user_seeker_1',
    seekerName: 'Rahul Sharma',
    seekerEmail: 'seeker@jobportal.com',
    seekerTitle: 'Full Stack Developer',
    resumeName: 'Rahul_Sharma_Resume.pdf',
    resumeContent: 'IIT Hyderabad CS student. Proficient with Javascript, React, CSS grids, state controllers.',
    coverLetter: 'I am applying for the Commerce Frontend Intern position. Looking to learn real-world web delivery and join Google Play development.',
    status: 'Applied',
    appliedAt: new Date(2026, 4, 28).toISOString(),
    history: [
      {
        status: 'Applied',
        changedAt: new Date(2026, 4, 28).toISOString(),
        note: 'Application submitted successfully.'
      }
    ]
  }
];

export const INITIAL_REVIEWS: CompanyReview[] = [
  {
    id: 'rev_1',
    seekerId: 'user_seeker_1',
    seekerName: 'Rahul Sharma',
    companyName: 'Google India',
    rating: 5,
    reviewText: 'Incredible work culture, brilliant colleagues, and state-of-the-art office infrastructure. Diverse environment with endless career growth prospects.',
    reviewedAt: new Date(2026, 4, 10).toISOString()
  },
  {
    id: 'rev_2',
    seekerId: 'user_seeker_2',
    seekerName: 'Aarav Mehta',
    companyName: 'Google India',
    rating: 4,
    reviewText: 'Great learning curves and mentorship programs. Highly collaborative squads, although alignment across locations can occasionally feel asynchronous.',
    reviewedAt: new Date(2026, 4, 12).toISOString()
  }
];

export const INITIAL_CHATS: ChatMessage[] = [
  {
    id: 'msg_1',
    senderId: 'user_recruiter_1',
    senderName: 'John Doe (Google)',
    recipientId: 'user_seeker_1',
    text: 'Hello Rahul, thank you for applying to the Google Senior Frontend Architect position. We are highly impressed by your portfolio projects. Are you open for a quick technical sync next week?',
    sentAt: new Date(2026, 4, 21, 11, 0, 0).toISOString()
  },
  {
    id: 'msg_2',
    senderId: 'user_seeker_1',
    senderName: 'Rahul Sharma',
    recipientId: 'user_recruiter_1',
    text: 'Hi John! Yes, absolutely. I would love to connect. Monday or Wednesday afternoon works great for me.',
    sentAt: new Date(2026, 4, 21, 11, 15, 0).toISOString()
  }
];

export const INITIAL_LOGS: SystemLog[] = [
  {
    id: 'log_1',
    action: 'System Bootstrapped',
    details: 'Database seeded with default seekers, recruiters, administrators, and jobs.',
    timestamp: new Date(2026, 4, 1).toISOString(),
    userEmail: 'system'
  },
  {
    id: 'log_2',
    action: 'Job Approved',
    details: 'Google India Posted "Senior Frontend Architect".',
    timestamp: new Date(2026, 4, 15).toISOString(),
    userEmail: 'admin@jobportal.com'
  }
];

// LocalStorage Engine Wrapper
export class PortalDB {
  private static initKey(key: string, initialData: any) {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(initialData));
    }
  }

  static initialize() {
    this.initKey('jp_users', INITIAL_USERS);
    this.initKey('jp_seeker_profile', INITIAL_SEEKER_PROFILE);
    this.initKey('jp_recruiters', INITIAL_RECRUITERS);
    this.initKey('jp_jobs', INITIAL_JOBS);
    this.initKey('jp_saved', INITIAL_SAVED);
    this.initKey('jp_applications', INITIAL_APPLICATIONS);
    this.initKey('jp_logs', INITIAL_LOGS);
    this.initKey('jp_reviews', INITIAL_REVIEWS);
    this.initKey('jp_chats', INITIAL_CHATS);
    this.initKey('jp_reports', []);
  }

  // Generic Getters/Setters
  private static get<T>(key: string): T[] {
    this.initialize();
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private static set<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Users
  static getUsers(): User[] {
    return this.get<User>('jp_users');
  }

  static saveUser(user: User) {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      list[idx] = user;
    } else {
      list.push(user);
    }
    this.set('jp_users', list);
    this.addLog('User Registered', `Account created for ${user.fullName} (${user.role})`, user.email);
  }

  static blockUser(id: string, blocked: boolean, actorEmail: string): boolean {
    const list = this.getUsers();
    const idx = list.findIndex(u => u.id === id);
    if (idx !== -1) {
      list[idx].blocked = blocked;
      this.set('jp_users', list);
      this.addLog(
        blocked ? 'User Blocked' : 'User Unblocked',
        `User ${list[idx].fullName} (${list[idx].email}) status toggled to blocked=${blocked}`,
        actorEmail
      );
      return true;
    }
    return false;
  }

  static deleteUser(id: string, actorEmail: string): boolean {
    const list = this.getUsers();
    const userToDelete = list.find(u => u.id === id);
    if (userToDelete) {
      this.set('jp_users', list.filter(u => u.id !== id));
      this.addLog('User Deleted', `User profile ${userToDelete.fullName} (${userToDelete.email}) deleted from system.`, actorEmail);
      return true;
    }
    return false;
  }

  // Job Seeker Profile
  static getSeekerProfile(userId: string): JobSeekerProfile {
    this.initialize();
    const raw = localStorage.getItem('jp_seeker_profile');
    if (raw) {
      const parsed = JSON.parse(raw) as JobSeekerProfile;
      if (parsed.id === userId) return parsed;
    }
    
    // Create new empty or load initial
    const initial = this.get<User>('jp_users').find(u => u.id === userId);
    return {
      id: userId,
      fullName: initial?.fullName || 'Anonymous Job Seeker',
      email: initial?.email || 'seeker@jobportal.com',
      title: 'Full Stack Software Engineer',
      bio: '',
      location: '',
      phone: '',
      skills: [],
      education: [],
      experience: []
    };
  }

  static saveSeekerProfile(profile: JobSeekerProfile) {
    localStorage.setItem('jp_seeker_profile', JSON.stringify(profile));
    this.addLog('Profile Updated', 'Job seeker details and resume updated.', profile.email);
  }

  // Recruiters
  static getRecruiters(): RecruiterProfile[] {
    return this.get<RecruiterProfile>('jp_recruiters');
  }

  static getRecruiterProfile(userId: string): RecruiterProfile {
    this.initialize();
    const list = this.getRecruiters();
    let profile = list.find(r => r.id === userId);
    if (!profile) {
      // Create lazy profile
      const user = this.getUsers().find(u => u.id === userId);
      profile = {
        id: userId,
        companyName: user?.fullName || 'Startup Hub',
        email: user?.email || '',
        description: 'Provide a complete organization description',
        website: 'https://company.io',
        location: 'Remote',
        approved: false // awaits admin approval
      };
      this.saveRecruiterProfile(profile);
    }
    return profile;
  }

  static saveRecruiterProfile(profile: RecruiterProfile) {
    const list = this.getRecruiters();
    const idx = list.findIndex(r => r.id === profile.id);
    if (idx !== -1) {
      list[idx] = profile;
    } else {
      list.push(profile);
    }
    this.set('jp_recruiters', list);
    this.addLog('Company Profile Saved', `Profile for ${profile.companyName} was updated.`, profile.email);
  }

  static approveRecruiter(id: string, approve: boolean, actorEmail: string): boolean {
    const list = this.getRecruiters();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].approved = approve;
      this.set('jp_recruiters', list);
      this.addLog(
        approve ? 'Recruiter Approved' : 'Recruiter Suspended',
        `Company ${list[idx].companyName} registration approval set to ${approve}`,
        actorEmail
      );
      return true;
    }
    return false;
  }

  // Jobs
  static getJobs(): Job[] {
    return this.get<Job>('jp_jobs');
  }

  static saveJob(job: Job): Job {
    const list = this.getJobs();
    const idx = list.findIndex(j => j.id === job.id);
    if (idx !== -1) {
      list[idx] = job;
    } else {
      if (!job.id) job.id = 'job_' + generateId();
      list.push(job);
    }
    this.set('jp_jobs', list);
    this.addLog('Job Posting Created/Modified', `Title: "${job.title}" at "${job.companyName}"`, job.recruiterId);
    return job;
  }

  static deleteJob(id: string, actorIdOrEmail: string): boolean {
    const list = this.getJobs();
    const job = list.find(j => j.id === id);
    if (job) {
      this.set('jp_jobs', list.filter(j => j.id !== id));
      this.addLog('Job Deleted', `Job posting "${job.title}" removed.`, actorIdOrEmail);
      return true;
    }
    return false;
  }

  static flagJob(id: string, status: 'active' | 'flagged' | 'closed', actorEmail: string): boolean {
    const list = this.getJobs();
    const idx = list.findIndex(j => j.id === id);
    if (idx !== -1) {
      list[idx].status = status;
      this.set('jp_jobs', list);
      this.addLog(
        `Job Status Changed: ${status}`,
        `Job "${list[idx].title}" from "${list[idx].companyName}" marked as ${status}`,
        actorEmail
      );
      return true;
    }
    return false;
  }

  // Saved Jobs / Favorites
  static getSavedJobs(seekerId: string): SavedJob[] {
    return this.get<SavedJob>('jp_saved').filter(s => s.seekerId === seekerId);
  }

  static toggleSaveJob(seekerId: string, jobId: string): boolean {
    const list = this.get<SavedJob>('jp_saved');
    const idx = list.findIndex(s => s.seekerId === seekerId && s.jobId === jobId);
    let isSaved = false;
    
    if (idx !== -1) {
      list.splice(idx, 1);
      isSaved = false;
    } else {
      list.push({
        id: 'saved_' + generateId(),
        seekerId,
        jobId,
        savedAt: new Date().toISOString()
      });
      isSaved = true;
    }
    this.set('jp_saved', list);
    return isSaved;
  }

  // Applications
  static getApplications(): Application[] {
    return this.get<Application>('jp_applications');
  }

  static applyForJob(application: Omit<Application, 'id' | 'appliedAt' | 'history'>): Application {
    const list = this.getApplications();
    const newApp: Application = {
      ...application,
      id: 'app_' + generateId(),
      appliedAt: new Date().toISOString(),
      history: [
        {
          status: 'Applied',
          changedAt: new Date().toISOString(),
          note: 'Application submitted successfully with attachment.'
        }
      ]
    };
    list.push(newApp);
    this.set('jp_applications', list);
    this.addLog('Applied for Job', `Applicant ${newApp.seekerName} applied to Job ID: ${newApp.jobId}`, newApp.seekerEmail);
    return newApp;
  }

  static updateApplicationStatus(id: string, status: ApplicationStatus, note: string, actorEmail: string): boolean {
    const list = this.getApplications();
    const idx = list.findIndex(a => a.id === id);
    if (idx !== -1) {
      const app = list[idx];
      app.status = status;
      app.history.unshift({
        status,
        changedAt: new Date().toISOString(),
        note: note || `Application status transitioned to ${status}`
      });
      this.set('jp_applications', list);
      this.addLog('Application Status Updated', `Job ID: ${app.jobId}, Applicant: ${app.seekerName} status set to ${status}`, actorEmail);
      return true;
    }
    return false;
  }

  // Logs
  static getLogs(): SystemLog[] {
    return this.get<SystemLog>('jp_logs');
  }

  static addLog(action: string, details: string, userEmail: string) {
    const list = this.get<SystemLog>('jp_logs');
    list.unshift({
      id: 'log_' + generateId(),
      action,
      details,
      timestamp: new Date().toISOString(),
      userEmail
    });
    // Keep max 100 logs for memory safety
    if (list.length > 100) list.pop();
    this.set('jp_logs', list);
  }

  // Company Reviews
  static getCompanyReviews(): CompanyReview[] {
    return this.get<CompanyReview>('jp_reviews');
  }

  static addCompanyReview(review: Omit<CompanyReview, 'id' | 'reviewedAt'>): CompanyReview {
    const list = this.getCompanyReviews();
    const newReview: CompanyReview = {
      ...review,
      id: 'rev_' + generateId(),
      reviewedAt: new Date().toISOString()
    };
    list.unshift(newReview);
    this.set('jp_reviews', list);
    this.addLog('Review Submitted', `Added review for ${review.companyName} with score ⭐ ${review.rating}`, review.seekerName || 'anonymous');
    return newReview;
  }

  // Chat Messages
  static getChatMessages(): ChatMessage[] {
    return this.get<ChatMessage>('jp_chats');
  }

  static addChatMessage(chat: Omit<ChatMessage, 'id' | 'sentAt'>): ChatMessage {
    const list = this.getChatMessages();
    const newMsg: ChatMessage = {
      ...chat,
      id: 'msg_' + generateId(),
      sentAt: new Date().toISOString()
    };
    list.push(newMsg);
    this.set('jp_chats', list);
    
    // Add dynamic automated reply simulation from company recruiters after 1.5 seconds!
    // Since we are running fully client-side, we can schedule an auto-reply to amaze the reviewer!
    if (chat.senderId.startsWith('user_seeker')) {
      setTimeout(() => {
        const chats = this.getChatMessages();
        const autoRepliedMsg: ChatMessage = {
          id: 'msg_auto_' + generateId(),
          senderId: chat.recipientId,
          senderName: chat.recipientId === 'user_recruiter_1' ? 'John Doe (Google)' : 'Alice Johnson (Supabase)',
          recipientId: chat.senderId,
          text: `Thank you for your message! Our talent acquisition squad has received your query. Please note that active updates regarding applications will be updated here in the recruitment pipeline.`,
          sentAt: new Date().toISOString()
        };
        chats.push(autoRepliedMsg);
        this.set('jp_chats', chats);
        
        // Trigger a custom event to notify active screens to refresh chat!
        window.dispatchEvent(new CustomEvent('jp_chat_received', { detail: autoRepliedMsg }));
      }, 1500);
    }
    
    return newMsg;
  }

  // Fake Job Flagging & Reports
  static getFakeReports(): CustomFakeJobReport[] {
    return this.get<CustomFakeJobReport>('jp_reports');
  }

  static addFakeReport(report: Omit<CustomFakeJobReport, 'id' | 'timestamp'>): CustomFakeJobReport {
    const list = this.getFakeReports();
    const newReport: CustomFakeJobReport = {
      ...report,
      id: 'rep_' + generateId(),
      timestamp: new Date().toISOString()
    };
    list.unshift(newReport);
    this.set('jp_reports', list);
    this.addLog('Job Ad Reported', `Job ID: ${report.jobId} flagged by ${report.seekerName} for reason: "${report.reason}"`, 'moderation-system');
    
    // If the reported count for this job becomes high, or optionally, we flag the job status as "flagged" immediately!
    const jobs = this.getJobs();
    const jobIdx = jobs.findIndex(j => j.id === report.jobId);
    if (jobIdx !== -1) {
      jobs[jobIdx].status = 'flagged';
      this.set('jp_jobs', jobs);
    }
    
    return newReport;
  }

  // Subscriptions & Plans Upgrade
  static upgradePlan(userId: string, plan: 'free' | 'premium'): boolean {
    const users = this.getUsers();
    const userIdx = users.findIndex(u => u.id === userId);
    if (userIdx !== -1) {
      users[userIdx].plan = plan;
      if (plan === 'premium') {
        const date = new Date();
        date.setMonth(date.getMonth() + 12); // valid for 1 year
        users[userIdx].premiumExpires = date.toISOString();
      } else {
        users[userIdx].premiumExpires = undefined;
      }
      this.set('jp_users', users);
      
      // Keep local session updated!
      const activeUserStr = localStorage.getItem('jp_active_user');
      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr) as User;
        if (activeUser.id === userId) {
          activeUser.plan = plan;
          activeUser.premiumExpires = users[userIdx].premiumExpires;
          localStorage.setItem('jp_active_user', JSON.stringify(activeUser));
        }
      }
      
      this.addLog('Subscription Plan Updated', `User account plan updated to: ${plan.toUpperCase()}`, users[userIdx].email);
      return true;
    }
    return false;
  }

  // Withdraw / Cancel Application Seeker Feature
  static withdrawApplication(appId: string): boolean {
    const list = this.getApplications();
    const app = list.find(a => a.id === appId);
    if (app) {
      const filtered = list.filter(a => a.id !== appId);
      this.set('jp_applications', filtered);
      this.addLog('Application Cancelled', `Candidate withdrew application to Job: ${app.jobId}`, app.seekerEmail);
      return true;
    }
    return false;
  }

  // Quiz Score Submission Seeker Feature
  static saveQuizScore(appId: string, score: number, totalQuestions: number): boolean {
    const list = this.getApplications();
    const idx = list.findIndex(a => a.id === appId);
    if (idx !== -1) {
      list[idx].quizScore = {
        score,
        totalQuestions,
        completedAt: new Date().toISOString()
      };
      
      // Auto upgrade status if score is high! Let's transition to "Under Review" or similar note
      list[idx].history.unshift({
        status: list[idx].status,
        changedAt: new Date().toISOString(),
        note: `Online knowledge test submitted: Got ${score}/${totalQuestions} score.`
      });
      
      this.set('jp_applications', list);
      this.addLog('Quiz Completed', `Candidate scored ${score}/${totalQuestions} on job test quiz`, list[idx].seekerEmail);
      return true;
    }
    return false;
  }

  // Schedule Interview Recruiter Feature
  static scheduleInterview(appId: string, date: string, time: string, link: string, actorEmail: string): boolean {
    const list = this.getApplications();
    const idx = list.findIndex(a => a.id === appId);
    if (idx !== -1) {
      const app = list[idx];
      app.status = 'Interviewing';
      app.interview = {
        date,
        time,
        link,
        updatedAt: new Date().toISOString()
      };
      
      app.history.unshift({
        status: 'Interviewing',
        changedAt: new Date().toISOString(),
        note: `Interview scheduled on ${date} at ${time}. Join via link: ${link}`
      });
      
      this.set('jp_applications', list);
      this.addLog('Interview Scheduled', `Candidate: ${app.seekerName} scheduled for interview call.`, actorEmail);
      return true;
    }
    return false;
  }
}
