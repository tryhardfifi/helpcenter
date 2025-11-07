import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores';
import { getUserCompanyId } from '@/services/userService';
import { getDataSource } from '@/services/dataService';

interface UseCompanyIdReturn {
  companyId: string | null;
  loading: boolean;
}

// Custom hook to get the user's companyId
export const useCompanyId = (): UseCompanyIdReturn => {
  const user = useAuthStore((state) => state.user);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCompanyId = async () => {
      setLoading(true);

      // In mock mode, use the hardcoded company ID
      if (getDataSource()) {
        setCompanyId('acme-inc-123');
        setLoading(false);
        return;
      }

      // In Firestore mode, fetch from user document
      if (user?.email) {
        const id = await getUserCompanyId(user.email);
        setCompanyId(id);
      }

      setLoading(false);
    };

    fetchCompanyId();
  }, [user]);

  return { companyId, loading };
};
