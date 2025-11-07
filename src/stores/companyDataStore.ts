import { create } from 'zustand';
import { getCompany, getCompanyPrompts, getCompanyArticles, fetchAnalyticsForDashboard } from '@/services/dataService';

interface CompanyDataStore {
  company: any;
  prompts: any[];
  articles: any[];
  analytics: any;
  loading: boolean;
  error: any;
  setCompany: (company: any) => void;
  setPrompts: (prompts: any[]) => void;
  setArticles: (articles: any[]) => void;
  setAnalytics: (analytics: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: any) => void;
  fetchData: (companyId: string | null) => Promise<void>;
  refetch: () => void;
  reset: () => void;
  _currentCompanyId: string | null;
}

export const useCompanyDataStore = create<CompanyDataStore>((set, get) => ({
  company: null,
  prompts: [],
  articles: [],
  analytics: null,
  loading: true,
  error: null,
  _currentCompanyId: null,

  setCompany: (company) => set({ company }),
  setPrompts: (prompts) => set({ prompts }),
  setArticles: (articles) => set({ articles }),
  setAnalytics: (analytics) => set({ analytics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchData: async (companyId: string | null) => {
    if (!companyId) {
      set({ loading: false });
      return;
    }

    set({ loading: true, error: null, _currentCompanyId: companyId });

    try {
      // Fetch all data in parallel
      const [companyData, promptsData, articlesData] = await Promise.all([
        getCompany(companyId),
        getCompanyPrompts(companyId),
        getCompanyArticles(companyId),
      ]);

      set({
        company: companyData,
        prompts: promptsData,
        articles: articlesData
      });

      // Fetch analytics from subcollection (competitors come from analytics now)
      if (companyData) {
        const analyticsData = await fetchAnalyticsForDashboard(
          companyId,
          companyData.name,
          [] // Pass empty array, competitors will be extracted from runs
        );
        set({ analytics: analyticsData });
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      set({ error: err });
    } finally {
      set({ loading: false });
    }
  },

  refetch: () => {
    const { _currentCompanyId, fetchData } = get();
    if (_currentCompanyId) {
      fetchData(_currentCompanyId);
    }
  },

  reset: () => set({
    company: null,
    prompts: [],
    articles: [],
    analytics: null,
    loading: true,
    error: null,
    _currentCompanyId: null
  })
}));
