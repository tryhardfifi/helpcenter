import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AuthContextType, AuthResponse, OnboardingStatus, UserData } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string): Promise<AuthResponse> => {
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
  };

  const logout = async (): Promise<AuthResponse> => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const checkOnboardingStatus = async (userEmail: string): Promise<OnboardingStatus> => {
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
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    checkOnboardingStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
