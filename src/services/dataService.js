import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc } from "firebase/firestore";
import {
  getCompany as getMockCompany,
  getCompanyPrompts as getMockCompanyPrompts,
  getPromptById as getMockPromptById,
  getCompanyArticles as getMockCompanyArticles,
  getArticleById as getMockArticleById,
} from "../data/mockData";

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
      trend: "stable",
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      totalMentions: 0,
      analytics: {
        mentionsOverTime: [],
        rankingsOverTime: [],
        averagePosition: 0,
        sentiment: "neutral",
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
      trend: "stable",
      createdAt: now,
      lastUpdated: now,
      totalMentions: 0,
      analytics: {
        mentionsOverTime: [],
        rankingsOverTime: [],
        averagePosition: 0,
        sentiment: "neutral",
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
