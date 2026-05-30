export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'seeker' | 'recruiter' | 'admin';
  createdAt: string;
  blocked?: boolean;
}

export interface JobSeekerProfile {
  id: string; // matches User.id
  fullName: string;
  email: string;
  bio: string;
  title: string;
  location: string;
  phone: string;
  skills: string[];
  education: Education[];
  experience: Experience[];
  resumeName?: string;
  resumeUrl?: string; // or base64 or placeholder
  photoUrl?: string;
}

export interface Education {
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface RecruiterProfile {
  id: string; // matches User.id
  companyName: string;
  email: string;
  description: string;
  website: string;
  location: string;
  logoUrl?: string;
  approved: boolean;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';

export interface Job {
  id: string;
  recruiterId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  requirements: string[]; // critical skills or guidelines
  skills: string[];
  location: string;
  salaryMin: number;
  salaryMax: number;
  type: JobType;
  experienceLevel: ExperienceLevel;
  status: 'active' | 'closed' | 'flagged';
  createdAt: string;
}

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Rejected';

export interface StatusHistoryItem {
  status: ApplicationStatus;
  changedAt: string;
  note: string;
}

export interface Application {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  seekerTitle: string;
  resumeName: string;
  resumeContent?: string; // metadata/snippet
  coverLetter?: string;
  status: ApplicationStatus;
  appliedAt: string;
  history: StatusHistoryItem[];
}

export interface SavedJob {
  id: string;
  seekerId: string;
  jobId: string;
  savedAt: string;
}

export interface SystemLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  userEmail: string;
}
