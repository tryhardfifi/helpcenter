import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc } from "firebase/firestore";
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
    return getMockCompanyPrompts("acme-inc-123");
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
    return mockRuns[promptId] || [];
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

    if (!mockRuns[promptId]) {
      mockRuns[promptId] = [];
    }
    mockRuns[promptId].unshift(mockRun);

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

  return savedRun;
};
