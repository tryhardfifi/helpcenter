import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // Create user document in Firestore
      const userRef = doc(db, 'users', email);
      await setDoc(userRef, {
        email,
        createdAt: new Date().toISOString(),
        role: 'owner',
        onboardingCompleted: false
      });

      return { success: true, user: result.user, isNewUser: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const checkOnboardingStatus = async (userEmail) => {
    try {
      const userRef = doc(db, 'users', userEmail);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { needsOnboarding: true, hasCompany: false };
      }

      const userData = userSnap.data();
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
