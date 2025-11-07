import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AuthResponse, OnboardingStatus, UserData } from '@/types';

interface AuthStore {
  user: FirebaseUser | null;
  loading: boolean;
  setUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<AuthResponse>;
  checkOnboardingStatus: (userEmail: string) => Promise<OnboardingStatus>;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),

  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  signup: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore
      const userRef = doc(db, 'users', email);
      const userData: UserData = {
        email,
        createdAt: new Date().toISOString(),
        role: 'owner',
        onboardingCompleted: false
      };
      await setDoc(userRef, userData);

      return { success: true, user: result.user, isNewUser: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  logout: async (): Promise<AuthResponse> => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  checkOnboardingStatus: async (userEmail: string): Promise<OnboardingStatus> => {
    try {
      const userRef = doc(db, 'users', userEmail);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { needsOnboarding: true, hasCompany: false };
      }

      const userData = userSnap.data() as UserData;
      const hasCompany = !!userData.companyId;
      const onboardingCompleted = userData.onboardingCompleted || false;

      return {
        needsOnboarding: !hasCompany || !onboardingCompleted,
        hasCompany,
        companyId: userData.companyId
      };
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return { needsOnboarding: true, hasCompany: false };
    }
  },

  initialize: () => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      set({ user: firebaseUser, loading: false });
    });
    return unsubscribe;
  }
}));
