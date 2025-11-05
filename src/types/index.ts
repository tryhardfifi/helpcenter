import { User as FirebaseUser } from 'firebase/auth';

export interface AuthResponse {
  success: boolean;
  user?: FirebaseUser;
  error?: string;
  isNewUser?: boolean;
}

export interface OnboardingStatus {
  needsOnboarding: boolean;
  hasCompany: boolean;
  companyId?: string;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<AuthResponse>;
  checkOnboardingStatus: (userEmail: string) => Promise<OnboardingStatus>;
}

export interface UserData {
  email: string;
  createdAt: string;
  role: string;
  onboardingCompleted: boolean;
  companyId?: string;
}

export interface CompanyData {
  id: string;
  name: string;
  createdAt: string;
  industry?: string;
  website?: string;
}

export interface PromptData {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

export interface RunData {
  id: string;
  promptId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  results?: any;
}

export type DataSource = 'demo' | 'live';
