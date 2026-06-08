export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'seeker' | 'recruiter' | 'admin';
  createdAt: string;
  blocked?: boolean;
  plan?: 'free' | 'premium'; // Subscription Plan type
  premiumExpires?: string;
  emailVerified?: boolean;
  mobileVerified?: boolean;
  trustScore?: number;
  verifiedHr?: boolean;
  mobileNumber?: string;
  aadhaarVerified?: boolean;
  educationVerified?: boolean;
  verifiedCompany?: boolean;
  companyName?: string;
  companyWebsite?: string;
  companyGst?: string;
  companyLinkedin?: string;
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
  githubUrl?: string; // Portfolio details
  linkedinUrl?: string;
  portfolioUrl?: string;
  certificates?: Certificate[];
  resumeBuilderData?: ResumeBuilderData; // Saved Resume Builder configuration
}

export interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
}

export interface ResumeBuilderData {
  templateId: 'modern' | 'minimalist' | 'creative';
  summary: string;
  selectedEducations: string[]; // matching school names
  selectedExperiences: string[]; // matching company names
  projects: string;
  certificationsText: string;
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
  isPremiumRecruiter?: boolean;
}

export type JobType = 'Full-time' | 'Part-time' | 'Contract' | 'Remote' | 'Internship';
export type ExperienceLevel = 'Entry' | 'Mid' | 'Senior' | 'Lead';

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIdx: number;
}

export interface Quiz {
  id: string;
  title: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

export interface Interview {
  date: string;
  time: string;
  link: string;
  updatedAt: string;
}

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
  quiz?: Quiz; // Optional Online Assessment Quiz
  expiryDate?: string; // Expire date attribute
  isWalkinDrive?: boolean; // Walk-in Drive Section classification
  isInternshipCategory?: boolean; // Internship Section category
}

export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interviewing' | 'Offered' | 'Rejected';

export interface StatusHistoryItem {
  status: ApplicationStatus;
  changedAt: string;
  note: string;
}

export interface SeekerQuizScore {
  score: number;
  totalQuestions: number;
  completedAt: string;
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
  quizScore?: SeekerQuizScore; // Associated completed test result
  interview?: Interview; // Associated Interview setup settings
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

export interface CompanyReview {
  id: string;
  seekerId: string;
  seekerName: string;
  companyName: string;
  rating: number; // 1 to 5
  reviewText: string;
  reviewedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  text: string;
  sentAt: string;
}

export interface CustomFakeJobReport {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  reason: string;
  timestamp: string;
}

