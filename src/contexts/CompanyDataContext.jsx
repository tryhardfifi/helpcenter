import { createContext, useContext, useState, useEffect } from "react";
import { useCompanyId } from "@/hooks/useCompanyId";
import { getCompany, getCompanyPrompts, getCompanyArticles, fetchAnalyticsForDashboard } from "@/services/dataService";

const CompanyDataContext = createContext();

export const useCompanyData = () => {
  const context = useContext(CompanyDataContext);
  if (!context) {
    throw new Error("useCompanyData must be used within a CompanyDataProvider");
  }
  return context;
};

export const CompanyDataProvider = ({ children }) => {
  const { companyId, loading: loadingCompanyId } = useCompanyId();
  const [company, setCompany] = useState(null);
  const [prompts, setPrompts] = useState([]);
  const [articles, setArticles] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
