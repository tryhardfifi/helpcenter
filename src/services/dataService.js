import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, setDoc } from "firebase/firestore";
import {
  getCompany as getMockCompany,
  getCompanyPrompts as getMockCompanyPrompts,
  getPromptById as getMockPromptById,
  getCompanyArticles as getMockCompanyArticles,
  getArticleById as getMockArticleById,
  mockRuns,
} from "../data/mockData";
import { runPromptAnalysis } from "./promptRunner";

// Data source toggle - can be controlled by user preference
let useMockData = true;

export const setDataSource = (useMock) => {
  useMockData = useMock;
  // Store preference in localStorage
  localStorage.setItem("useMockData", JSON.stringify(useMock));
};

export const getDataSource = () => {
  // Check localStorage for saved preference
  const savedPreference = localStorage.getItem("useMockData");
  if (savedPreference !== null) {
    useMockData = JSON.parse(savedPreference);
  }
  return useMockData;
};

// Initialize data source from localStorage
if (typeof window !== "undefined") {
  getDataSource();
}

// Company operations
export const getCompany = async (companyId) => {
  if (useMockData) {
    // For mock data, always return the mock company
    return getMockCompany("acme-inc-123");
  }

  if (!companyId) {
    console.warn("No companyId provided to getCompany");
    return null;
  }

  try {
    const companyRef = doc(db, "companies", companyId);
    const companySnap = await getDoc(companyRef);

    if (companySnap.exists()) {
      return { id: companySnap.id, ...companySnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching company from Firestore:", error);
    return null;
  }
};

export const updateCompany = async (companyId, updates) => {
  if (useMockData) {
    // For mock data, just simulate success
    console.log("Mock mode: Would update company with:", updates);
    return true;
  }

  if (!companyId) {
    console.warn("No companyId provided to updateCompany");
    return false;
  }

  try {
    const companyRef = doc(db, "companies", companyId);
    await updateDoc(companyRef, updates);
    return true;
  } catch (error) {
    console.error("Error updating company in Firestore:", error);
    throw error;
  }
};

// Prompts operations
export const getCompanyPrompts = async (companyId) => {
  if (useMockData) {
    const prompts = getMockCompanyPrompts("acme-inc-123");
    // Remove pre-populated analytics to simulate a fresh state
    return prompts.map(prompt => ({
      ...prompt,
      mentionRate: 0,
      totalMentions: 0,
      analytics: {
        mentionsOverTime: [],
        rankingsOverTime: [],
        averagePosition: 0,
        coMentions: [],
      },
    }));
  }

  if (!companyId) {
    console.warn("No companyId provided to getCompanyPrompts");
    return [];
  }

  try {
    const promptsRef = collection(db, "companies", companyId, "prompts");
    const promptsSnap = await getDocs(promptsRef);

    return promptsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching prompts from Firestore:", error);
    return [];
  }
};

export const getPromptById = async (companyId, promptId) => {
  if (useMockData) {
    return getMockPromptById("acme-inc-123", promptId);
  }

  if (!companyId) {
    console.warn("No companyId provided to getPromptById");
    return null;
  }

  try {
    const promptRef = doc(db, "companies", companyId, "prompts", promptId);
    const promptSnap = await getDoc(promptRef);

    if (promptSnap.exists()) {
      return { id: promptSnap.id, ...promptSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching prompt from Firestore:", error);
    return null;
  }
};

export const createPrompt = async (companyId, promptText) => {
  if (useMockData) {
    // For mock mode, just simulate success
    console.log("Mock mode: Would create prompt:", promptText);
    return {
      id: `prompt-${Date.now()}`,
      text: promptText,
      mentionRate: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalMentions: 0,
      analytics: {
        mentionsOverTime: [],
        rankingsOverTime: [],
        averagePosition: 0,
        coMentions: [],
      },
    };
  }

  if (!companyId) {
    console.warn("No companyId provided to createPrompt");
    throw new Error("Company ID is required");
  }

  try {
    const promptsRef = collection(db, "companies", companyId, "prompts");
    const now = new Date().toISOString();

    const newPrompt = {
      text: promptText,
      mentionRate: 0,
      createdAt: now,
      lastUpdated: now,
      totalMentions: 0,
      analytics: {
        mentionsOverTime: [],
        rankingsOverTime: [],
        averagePosition: 0,
        coMentions: [],
      },
    };

    const docRef = await addDoc(promptsRef, newPrompt);
    return { id: docRef.id, ...newPrompt };
  } catch (error) {
    console.error("Error creating prompt in Firestore:", error);
    throw error;
  }
};

// Articles operations
export const getCompanyArticles = async (companyId) => {
  if (useMockData) {
    return getMockCompanyArticles("acme-inc-123");
  }

  if (!companyId) {
    console.warn("No companyId provided to getCompanyArticles");
    return [];
  }

  try {
    const articlesRef = collection(db, "companies", companyId, "articles");
    const articlesSnap = await getDocs(articlesRef);

    return articlesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching articles from Firestore:", error);
    return [];
  }
};

export const getArticleById = async (companyId, articleId) => {
  if (useMockData) {
    return getMockArticleById("acme-inc-123", articleId);
  }

  if (!companyId) {
    console.warn("No companyId provided to getArticleById");
    return null;
  }

  try {
    const articleRef = doc(db, "companies", companyId, "articles", articleId);
    const articleSnap = await getDoc(articleRef);

    if (articleSnap.exists()) {
      return { id: articleSnap.id, ...articleSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching article from Firestore:", error);
    return null;
  }
};

// Competitor operations
export const createCompetitor = async (companyId, competitorUrl) => {
  if (useMockData) {
    // For mock mode, just simulate success
    console.log("Mock mode: Would create competitor with URL:", competitorUrl);
    return {
      id: `competitor-${Date.now()}`,
      url: competitorUrl,
      name: new URL(competitorUrl).hostname,
      createdAt: new Date().toISOString(),
    };
  }

  if (!companyId) {
    console.warn("No companyId provided to createCompetitor");
    throw new Error("Company ID is required");
  }

  try {
    const companyRef = doc(db, "companies", companyId);
    const companySnap = await getDoc(companyRef);

    if (!companySnap.exists()) {
      throw new Error("Company not found");
    }

    const companyData = companySnap.data();
    const competitors = companyData.competitors || [];

    // Create new competitor object
    const newCompetitor = {
      id: `competitor-${Date.now()}`,
      url: competitorUrl,
      name: new URL(competitorUrl).hostname,
      createdAt: new Date().toISOString(),
    };

    // Add to competitors array
    const updatedCompetitors = [...competitors, newCompetitor];

    // Update company document
    await updateDoc(companyRef, {
      competitors: updatedCompetitors,
    });

    return newCompetitor;
  } catch (error) {
    console.error("Error creating competitor in Firestore:", error);
    throw error;
  }
};

// Runs operations
/**
 * Get all runs for a prompt (sorted newest first)
 */
export const getPromptRuns = async (companyId, promptId) => {
  if (useMockData) {
    const runs = mockRuns[promptId] || [];
    console.log('[dataService.getPromptRuns] Mock mode - returning', runs.length, 'runs for promptId:', promptId);
    // Return a new array reference to ensure React detects changes
    return [...runs];
  }

  if (!companyId || !promptId) {
    console.warn("companyId and promptId are required for getPromptRuns");
    return [];
  }

  try {
    const runsRef = collection(db, "companies", companyId, "prompts", promptId, "runs");
    const runsSnap = await getDocs(runsRef);

    const runs = runsSnap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to JS Date if needed
        createdAt: data.createdAt?.toDate?.() || data.createdAt,
      };
    });

    // Sort by createdAt descending (newest first)
    return runs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (error) {
    console.error("Error fetching runs from Firestore:", error);
    return [];
  }
};

/**
 * Save a run to the database
 * This is a pure database operation - does not contain business logic
 */
export const savePromptRun = async (companyId, promptId, runData) => {
  const {
    mentionPercentage,
    position,
    detailedRuns = [],
    competitorMetrics = {},
    analyzedAt
  } = runData;

  if (useMockData) {
    const mockRun = {
      id: `run-${Date.now()}`,
      promptId,
      createdAt: new Date().toISOString(),
      mentionPercentage,
      position,
      detailedRuns,
      competitorMetrics,
      analyzedAt,
    };

    console.log('[dataService.savePromptRun] Mock mode - saving run for promptId:', promptId);
    if (!mockRuns[promptId]) {
      console.log('[dataService.savePromptRun] Creating new array for promptId:', promptId);
      mockRuns[promptId] = [];
    }
    mockRuns[promptId].unshift(mockRun);
    console.log('[dataService.savePromptRun] Now have', mockRuns[promptId].length, 'runs for promptId:', promptId);

    return mockRun;
  }

  if (!companyId || !promptId) {
    console.warn("companyId and promptId are required for savePromptRun");
    throw new Error("Company ID and Prompt ID are required");
  }

  try {
    const runsRef = collection(db, "companies", companyId, "prompts", promptId, "runs");
    const now = new Date();

    const newRun = {
      promptId,
      createdAt: now,
      mentionPercentage,
      position,
      detailedRuns,
      competitorMetrics,
      analyzedAt,
    };

    const docRef = await addDoc(runsRef, newRun);

    // Update parent prompt with latest metrics
    const promptRef = doc(db, "companies", companyId, "prompts", promptId);
    await updateDoc(promptRef, {
      lastUpdated: now,
      mentionRate: mentionPercentage,
    });

    return { id: docRef.id, ...newRun };
  } catch (error) {
    console.error("Error saving run to Firestore:", error);
    throw error;
  }
};

/**
 * Update prompt analytics from all runs
 * Aggregates data from runs subcollection into prompt document
 */
export const updatePromptAnalytics = async (companyId, promptId) => {
  if (useMockData) {
    return;
  }

  if (!companyId || !promptId) {
    return;
  }

  try {
    // Get all runs for this prompt
    const runs = await getPromptRuns(companyId, promptId);

    if (runs.length === 0) {
      return;
    }

    // Calculate analytics from runs
    const mentionsOverTime = runs.map(run => ({
      date: new Date(run.createdAt).toISOString().split('T')[0],
      acme: run.mentionPercentage || 0
    }));

    const rankingsOverTime = runs.map(run => ({
      date: new Date(run.createdAt).toISOString().split('T')[0],
      acme: run.position || 0
    }));

    // Calculate average position from all runs
    const positions = runs.filter(r => r.position).map(r => r.position);
    const averagePosition = positions.length > 0
      ? Math.round(positions.reduce((sum, pos) => sum + pos, 0) / positions.length * 10) / 10
      : 0;

    // Calculate total mentions
    const totalMentions = runs.filter(r => r.mentionPercentage > 0).length;

    // Update prompt document
    const promptRef = doc(db, "companies", companyId, "prompts", promptId);
    await updateDoc(promptRef, {
      totalMentions,
      analytics: {
        mentionsOverTime,
        rankingsOverTime,
        averagePosition,
        coMentions: [] // Can be populated later if needed
      }
    });

  } catch (error) {
    console.error("Error updating prompt analytics:", error);
  }
};

/**
 * Execute a prompt and save the results
 * This orchestrates the analysis and database write
 */
export const executePromptRun = async (companyId, promptId, promptData) => {
  const { text: promptText, companyName, competitors = [] } = promptData;

  // Extract competitor names from competitors array
  const competitorNames = competitors.map(c => c.name || c);

  // Step 1: Run the analysis (isolated business logic in promptRunner.js)
  const analysisResult = await runPromptAnalysis({
    promptText,
    companyName,
    competitorNames,
  });

  // Step 2: Save the results to database
  const savedRun = await savePromptRun(companyId, promptId, analysisResult);

  // Step 3: Update prompt analytics from all runs
  await updatePromptAnalytics(companyId, promptId);

  return savedRun;
};

// Analytics operations
/**
 * Get all analytics documents for a company
 */
export const getCompanyAnalytics = async (companyId) => {
  if (useMockData) {
    // For mock mode, return empty array (will be generated by seed script)
    return [];
  }

  if (!companyId) {
    console.warn("No companyId provided to getCompanyAnalytics");
    return [];
  }

  try {
    const analyticsRef = collection(db, "companies", companyId, "analytics");
    const analyticsSnap = await getDocs(analyticsRef);

    return analyticsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching analytics from Firestore:", error);
    return [];
  }
};

/**
 * Get analytics for a specific date
 */
export const getAnalyticsByDate = async (companyId, date) => {
  if (useMockData) {
    return null;
  }

  if (!companyId || !date) {
    console.warn("companyId and date are required for getAnalyticsByDate");
    return null;
  }

  try {
    const analyticsRef = doc(db, "companies", companyId, "analytics", date);
    const analyticsSnap = await getDoc(analyticsRef);

    if (analyticsSnap.exists()) {
      return { id: analyticsSnap.id, ...analyticsSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching analytics by date from Firestore:", error);
    return null;
  }
};

/**
 * Save computed analytics for a specific date
 */
export const saveAnalytics = async (companyId, date, analyticsData) => {
  if (useMockData) {
    console.log("Mock mode: Would save analytics for date:", date);
    return analyticsData;
  }

  if (!companyId || !date) {
    console.warn("companyId and date are required for saveAnalytics");
    throw new Error("Company ID and date are required");
  }

  try {
    const analyticsRef = doc(db, "companies", companyId, "analytics", date);
    // Use setDoc with merge to create or update
    await setDoc(analyticsRef, analyticsData, { merge: true });

    return { id: date, ...analyticsData };
  } catch (error) {
    console.error("Error saving analytics to Firestore:", error);
    throw error;
  }
};

/**
 * Get all runs from all prompts for analytics computation
 */
export const getAllPromptRuns = async (companyId) => {
  if (useMockData) {
    // Return all mock runs
    return Object.values(mockRuns).flat();
  }

  if (!companyId) {
    console.warn("No companyId provided to getAllPromptRuns");
    return [];
  }

  try {
    // Get all prompts first
    const prompts = await getCompanyPrompts(companyId);

    // Get all runs for each prompt
    const allRunsPromises = prompts.map(prompt =>
      getPromptRuns(companyId, prompt.id)
    );

    const allRunsArrays = await Promise.all(allRunsPromises);

    // Flatten the array of arrays
    return allRunsArrays.flat();
  } catch (error) {
    console.error("Error fetching all prompt runs from Firestore:", error);
    return [];
  }
};

/**
 * Fetch and aggregate analytics from the analytics subcollection
 * This replaces the old company.analytics structure
 */
export const fetchAnalyticsForDashboard = async (companyId, companyName, competitorNames) => {
  if (useMockData) {
    // In mock mode, compute analytics on-the-fly from existing runs
    try {
      const { computeDailyAnalytics, aggregateAnalyticsForDashboard } = await import('./analyticsComputation.js');

      // Get all runs from mock data
      const allRuns = Object.values(mockRuns).flat();

      if (allRuns.length === 0) {
        return null;
      }

      // Extract unique competitors from the runs themselves
      const competitorsFromRuns = new Set();
      allRuns.forEach(run => {
        if (run.competitorMetrics) {
          Object.keys(run.competitorMetrics).forEach(competitorName => {
            competitorsFromRuns.add(competitorName);
          });
        }
      });
      const actualCompetitorNames = Array.from(competitorsFromRuns);

      // Group runs by date to create daily analytics documents
      const runsByDate = {};
      allRuns.forEach(run => {
        const date = new Date(run.createdAt).toISOString().split('T')[0];
        if (!runsByDate[date]) {
          runsByDate[date] = [];
        }
        runsByDate[date].push(run);
      });

      // Compute analytics for each date using actual competitors from runs
      const competitors = actualCompetitorNames.map(name => ({ id: name.toLowerCase(), name }));
      const analyticsDocuments = Object.keys(runsByDate).map(date => {
        return computeDailyAnalytics({
          companyId,
          companyName,
          competitors,
          allPromptRuns: runsByDate[date],
          date
        });
      });

      // Aggregate the analytics (pass allRuns for source computation, use actual competitor names)
      const aggregated = aggregateAnalyticsForDashboard(
        analyticsDocuments,
        companyName,
        actualCompetitorNames,
        allRuns
      );

      return aggregated;
    } catch (error) {
      console.error("Error computing mock analytics:", error);
      return null;
    }
  }

  if (!companyId) {
    console.warn("No companyId provided to fetchAnalyticsForDashboard");
    return null;
  }

  try {
    // Dynamically import the aggregation function
    const { aggregateAnalyticsForDashboard } = await import('./analyticsComputation.js');

    // Fetch all analytics documents
    const analyticsDocuments = await getCompanyAnalytics(companyId);

    if (analyticsDocuments.length === 0) {
      return null;
    }

    // Extract competitors from the analytics documents
    const competitorsFromAnalytics = new Set();
    analyticsDocuments.forEach(doc => {
      if (doc.metrics?.competitors) {
        Object.keys(doc.metrics.competitors).forEach(competitorName => {
          competitorsFromAnalytics.add(competitorName);
        });
      }
    });
    const actualCompetitorNames = Array.from(competitorsFromAnalytics);

    console.log('[fetchAnalyticsForDashboard] Firestore: Competitors from analytics:', actualCompetitorNames);

    // Fetch all runs for source computation
    const allRuns = await getAllPromptRuns(companyId);

    // Aggregate the analytics (pass allRuns for source computation, use actual competitor names)
    const aggregated = aggregateAnalyticsForDashboard(
      analyticsDocuments,
      companyName,
      actualCompetitorNames,
      allRuns
    );

    return aggregated;
  } catch (error) {
    console.error("Error fetching and aggregating analytics:", error);
    return null;
  }
};
