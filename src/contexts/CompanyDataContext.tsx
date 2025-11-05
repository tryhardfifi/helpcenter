import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useCompanyId } from "@/hooks/useCompanyId";
import { getCompany, getCompanyPrompts, getCompanyArticles, fetchAnalyticsForDashboard } from "@/services/dataService";

interface CompanyDataContextType {
  company: any;
  prompts: any[];
  articles: any[];
  analytics: any;
  loading: boolean;
  error: any;
  refetch: () => void;
}

const CompanyDataContext = createContext<CompanyDataContextType | undefined>(undefined);

export const useCompanyData = (): CompanyDataContextType => {
  const context = useContext(CompanyDataContext);
  if (!context) {
    throw new Error("useCompanyData must be used within a CompanyDataProvider");
  }
  return context;
};

interface CompanyDataProviderProps {
  children: ReactNode;
}

export const CompanyDataProvider = ({ children }: CompanyDataProviderProps) => {
  const { companyId, loading: loadingCompanyId } = useCompanyId();
  const [company, setCompany] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const fetchData = async () => {
    if (loadingCompanyId || !companyId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch all data in parallel
      const [companyData, promptsData, articlesData] = await Promise.all([
        getCompany(companyId),
        getCompanyPrompts(companyId),
        getCompanyArticles(companyId),
      ]);

      setCompany(companyData);
      setPrompts(promptsData);
      setArticles(articlesData);

      // Fetch analytics from subcollection (competitors come from analytics now)
      if (companyData) {
        const analyticsData = await fetchAnalyticsForDashboard(
          companyId,
          companyData.name,
          [] // Pass empty array, competitors will be extracted from runs
        );
        setAnalytics(analyticsData);
      }
    } catch (err) {
      console.error("Error fetching company data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when companyId changes
  useEffect(() => {
    fetchData();
  }, [companyId, loadingCompanyId]);

  const refetch = () => {
    fetchData();
  };

  return (
    <CompanyDataContext.Provider
      value={{
        company,
        prompts,
        articles,
        analytics,
        loading,
        error,
        refetch,
      }}
    >
      {children}
    </CompanyDataContext.Provider>
  );
};
