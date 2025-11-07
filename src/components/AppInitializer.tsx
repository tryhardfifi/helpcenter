import { useEffect } from 'react';
import { useAuthStore, useCompanyDataStore } from '@/stores';
import { useCompanyId } from '@/hooks/useCompanyId';

// Component to initialize app-wide state
export const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const initialize = useAuthStore((state) => state.initialize);
  const loading = useAuthStore((state) => state.loading);
  const fetchData = useCompanyDataStore((state) => state.fetchData);
  const { companyId, loading: loadingCompanyId } = useCompanyId();

  // Initialize auth listener
  useEffect(() => {
    const unsubscribe = initialize();
    return () => unsubscribe();
  }, [initialize]);

  // Fetch company data when companyId changes
  useEffect(() => {
    if (!loadingCompanyId && companyId) {
      fetchData(companyId);
    }
  }, [companyId, loadingCompanyId, fetchData]);

  // Don't render children until auth is initialized
  if (loading) {
    return null;
  }

  return <>{children}</>;
};
