import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, setDoc, deleteDoc } from "firebase/firestore";
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
    // Return prompts as-is from mock data
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

export const deletePrompt = async (companyId, promptId) => {
  if (useMockData) {
    // For mock mode, just simulate success
    console.log("Mock mode: Would delete prompt:", promptId);
    return true;
  }

  if (!companyId || !promptId) {
    console.warn("companyId and promptId are required to delete a prompt");
    throw new Error("Company ID and Prompt ID are required");
  }

  try {
    const promptRef = doc(db, "companies", companyId, "prompts", promptId);
    await deleteDoc(promptRef);
    return true;
  } catch (error) {
    console.error("Error deleting prompt from Firestore:", error);
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
/**
 * Get all competitors for a company from the competitors subcollection
 */
export const getCompanyCompetitors = async (companyId) => {
  if (useMockData) {
    const mockCompany = getMockCompany("acme-inc-123");
    return mockCompany?.competitors || [];
  }

  if (!companyId) {
    console.warn("No companyId provided to getCompanyCompetitors");
    return [];
  }

  try {
    const competitorsRef = collection(db, "companies", companyId, "competitors");
    const competitorsSnap = await getDocs(competitorsRef);

    return competitorsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching competitors from Firestore:", error);
    return [];
  }
};

/**
 * Check if a competitor already exists by name (case-insensitive)
 */
export const findCompetitorByName = async (companyId, competitorName) => {
  if (useMockData) {
    const mockCompany = getMockCompany("acme-inc-123");
    const competitors = mockCompany?.competitors || [];
    return competitors.find(c => c.name?.toLowerCase() === competitorName.toLowerCase());
  }

  if (!companyId || !competitorName) {
    return null;
  }

  try {
    const competitors = await getCompanyCompetitors(companyId);
    return competitors.find(c => c.name?.toLowerCase() === competitorName.toLowerCase());
  } catch (error) {
    console.error("Error finding competitor by name:", error);
    return null;
  }
};

/**
 * Fetch URL for a competitor using GPT with web search
 */
export const fetchCompetitorUrl = async (competitorName) => {
  try {
    // Check if OpenAI API key is configured
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("OpenAI API key not configured, using fallback");
      return `https://www.${competitorName.toLowerCase().replace(/\s+/g, '')}.com`;
    }

    // Call OpenAI API with web search to find the competitor's official website
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: `What is the official website URL for the company "${competitorName}"? Please respond with ONLY the URL, nothing else. Format: https://www.example.com`
        }],
        temperature: 0.3,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const url = data.choices[0]?.message?.content?.trim();

    // Validate URL format
    if (url && url.startsWith('http')) {
      return url;
    }

    // Fallback if response is not a valid URL
    return `https://www.${competitorName.toLowerCase().replace(/\s+/g, '')}.com`;
  } catch (error) {
    console.error("Error fetching competitor URL:", error);
    // Fallback URL
    return `https://www.${competitorName.toLowerCase().replace(/\s+/g, '')}.com`;
  }
};

/**
 * Create a new competitor in the competitors subcollection
 */
export const createCompetitor = async (companyId, competitorName, competitorUrl) => {
  if (useMockData) {
    // For mock mode, just simulate success
    console.log("Mock mode: Would create competitor:", competitorName, competitorUrl);
    return {
      id: `competitor-${Date.now()}`,
      name: competitorName,
      url: competitorUrl,
      createdAt: new Date().toISOString(),
    };
  }

  if (!companyId || !competitorName) {
    console.warn("companyId and competitorName are required to create a competitor");
    throw new Error("Company ID and competitor name are required");
  }

  try {
    // Check if competitor already exists
    const existing = await findCompetitorByName(companyId, competitorName);
    if (existing) {
      console.log(`Competitor "${competitorName}" already exists, returning existing`);
      return existing;
    }

    // Fetch URL if not provided
    const url = competitorUrl || await fetchCompetitorUrl(competitorName);

    const competitorsRef = collection(db, "companies", companyId, "competitors");
    const now = new Date().toISOString();

    const newCompetitor = {
      name: competitorName,
      url: url,
      createdAt: now,
    };

    const docRef = await addDoc(competitorsRef, newCompetitor);
    return { id: docRef.id, ...newCompetitor };
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

    // Extract all competitors from runs (those that have competitorMetrics)
    const allCompetitors = new Set();
    runs.forEach(run => {
      if (run.competitorMetrics) {
        Object.keys(run.competitorMetrics).forEach(competitorName => {
          allCompetitors.add(competitorName);
        });
      }
    });

    // Calculate analytics from runs including all competitors
    const mentionsOverTime = runs.map(run => {
      const date = new Date(run.createdAt).toISOString().split('T')[0];
      const dataPoint = { date };

      // Add our company's mention percentage (first competitor is usually our company)
      const firstCompetitor = Array.from(allCompetitors)[0];
      if (firstCompetitor) {
        const compKey = firstCompetitor.replace(/\s+/g, '').charAt(0).toLowerCase() + firstCompetitor.replace(/\s+/g, '').slice(1);
        dataPoint[compKey] = run.mentionPercentage || 0;
      }

      // Add all competitor mention percentages
      if (run.competitorMetrics) {
        Object.entries(run.competitorMetrics).forEach(([competitorName, metrics]) => {
          const compKey = competitorName.replace(/\s+/g, '').charAt(0).toLowerCase() + competitorName.replace(/\s+/g, '').slice(1);
          dataPoint[compKey] = metrics.mentionPercentage || 0;
        });
      }

      return dataPoint;
    });

    const rankingsOverTime = runs.map(run => {
      const date = new Date(run.createdAt).toISOString().split('T')[0];
      const dataPoint = { date };

      // Add our company's position (first competitor is usually our company)
      const firstCompetitor = Array.from(allCompetitors)[0];
      if (firstCompetitor) {
        const compKey = firstCompetitor.replace(/\s+/g, '').charAt(0).toLowerCase() + firstCompetitor.replace(/\s+/g, '').slice(1);
        dataPoint[compKey] = run.position || 0;
      }

      // Add all competitor positions
      if (run.competitorMetrics) {
        Object.entries(run.competitorMetrics).forEach(([competitorName, metrics]) => {
          const compKey = competitorName.replace(/\s+/g, '').charAt(0).toLowerCase() + competitorName.replace(/\s+/g, '').slice(1);
          dataPoint[compKey] = metrics.averagePosition || 0;
        });
      }

      return dataPoint;
    });

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

  // Step 2: Create competitor docs in Firestore for any new competitors found
  if (analysisResult.competitorMetrics) {
    const competitorNamesFromAnalysis = Object.keys(analysisResult.competitorMetrics);

    // Process competitors in parallel
    await Promise.all(
      competitorNamesFromAnalysis.map(async (competitorName) => {
        try {
          await createCompetitor(companyId, competitorName, null);
        } catch (error) {
          console.error(`Error creating competitor "${competitorName}":`, error);
          // Continue even if one competitor fails
        }
      })
    );
  }

  // Step 3: Save the results to database
  const savedRun = await savePromptRun(companyId, promptId, analysisResult);

  // Step 4: Update prompt analytics from all runs
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
    // In mock mode, return the static mock analytics
    const mockCompany = getMockCompany("acme-inc-123");
    if (mockCompany && mockCompany.analytics) {
      return mockCompany.analytics;
    }
    return null;
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

// Sources operations
/**
 * Convert URL to a valid Firestore document ID
 * Firestore doc IDs cannot contain forward slashes, so we encode them
 */
function encodeUrlForDocId(url) {
  // Use btoa (browser-compatible base64 encoding)
  try {
    return btoa(url).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '');
  } catch (e) {
    // Fallback for URLs with special characters
    return encodeURIComponent(url).replace(/[^a-zA-Z0-9]/g, '_').substring(0, 1500);
  }
}

/**
 * Save or update a source in the sources collection
 * Increments citedCount each time the source is encountered
 *
 * @param {string} companyId - The company ID
 * @param {string} sourceUrl - The source URL
 * @param {string} sourceTitle - The source title
 * @param {string} sourceType - The source type (optional)
 * @returns {Promise<Object>} The saved source document
 */
export const saveSourceToFirestore = async (companyId, sourceUrl, sourceTitle, sourceType = null) => {
  if (useMockData) {
    console.log("Mock mode: Would save/update source:", sourceUrl);
    return { url: sourceUrl, title: sourceTitle, citedCount: 1 };
  }

  if (!companyId || !sourceUrl) {
    console.warn("companyId and sourceUrl are required for saveSourceToFirestore");
    throw new Error("Company ID and source URL are required");
  }

  try {
    // Use encoded URL as document ID
    const docId = encodeUrlForDocId(sourceUrl);
    const sourceRef = doc(db, "companies", companyId, "sources", docId);

    // Get existing document
    const sourceSnap = await getDoc(sourceRef);

    if (sourceSnap.exists()) {
      // Source exists - increment citedCount
      const existingData = sourceSnap.data();
      const newCitedCount = (existingData.citedCount || 0) + 1;

      await updateDoc(sourceRef, {
        citedCount: newCitedCount,
        lastSeen: new Date().toISOString(),
        // Update title if it changed
        title: sourceTitle
      });

      return {
        id: docId,
        url: sourceUrl,
        title: sourceTitle,
        citedCount: newCitedCount,
        type: existingData.type || sourceType,
        firstSeen: existingData.firstSeen,
        lastSeen: new Date().toISOString()
      };
    } else {
      // New source - create with citedCount = 1
      const now = new Date().toISOString();
      const newSource = {
        url: sourceUrl,
        title: sourceTitle,
        type: sourceType,
        citedCount: 1,
        firstSeen: now,
        lastSeen: now
      };

      await setDoc(sourceRef, newSource);

      return {
        id: docId,
        ...newSource
      };
    }
  } catch (error) {
    console.error("Error saving source to Firestore:", error);
    throw error;
  }
};

/**
 * Get all sources for a company
 *
 * @param {string} companyId - The company ID
 * @returns {Promise<Array>} Array of source documents
 */
export const getCompanySources = async (companyId) => {
  if (useMockData) {
    console.log("Mock mode: Would fetch sources");
    return [];
  }

  if (!companyId) {
    console.warn("No companyId provided to getCompanySources");
    return [];
  }

  try {
    const sourcesRef = collection(db, "companies", companyId, "sources");
    const sourcesSnap = await getDocs(sourcesRef);

    return sourcesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching sources from Firestore:", error);
    return [];
  }
};

/**
 * Extract and save all sources from prompt runs to the sources collection
 * This should be called after running all prompts for the day
 *
 * @param {string} companyId - The company ID
 * @param {Array<Object>} allRuns - All prompt runs to extract sources from
 * @param {string} companyUrl - The company's URL for owned source detection (optional)
 * @returns {Promise<Object>} Summary of sources processed
 */
export const updateSourcesFromRuns = async (companyId, allRuns, companyUrl = null) => {
  if (useMockData) {
    console.log("Mock mode: Would update sources from runs");
    return { totalSources: 0, newSources: 0, updatedSources: 0 };
  }

  if (!companyId || !allRuns || allRuns.length === 0) {
    console.warn("companyId and allRuns are required for updateSourcesFromRuns");
    return { totalSources: 0, newSources: 0, updatedSources: 0 };
  }

  try {
    const sourceMap = new Map();

    // Extract all sources from all runs
    allRuns.forEach(run => {
      if (!run.detailedRuns) return;

      run.detailedRuns.forEach(detailedRun => {
        if (!detailedRun.sources || detailedRun.sources.length === 0) return;

        detailedRun.sources.forEach(source => {
          if (!sourceMap.has(source.url)) {
            sourceMap.set(source.url, {
              url: source.url,
              title: source.title,
              count: 0
            });
          }
          // Increment count for each occurrence
          sourceMap.get(source.url).count++;
        });
      });
    });

    // Save each unique source to Firestore
    let newSources = 0;
    let updatedSources = 0;

    const sourcePromises = Array.from(sourceMap.entries()).map(async ([url, sourceData]) => {
      const docId = encodeUrlForDocId(url);
      const sourceRef = doc(db, "companies", companyId, "sources", docId);
      const sourceSnap = await getDoc(sourceRef);

      if (sourceSnap.exists()) {
        // Existing source - increment by the count
        const existingData = sourceSnap.data();
        const newCitedCount = (existingData.citedCount || 0) + sourceData.count;

        await updateDoc(sourceRef, {
          citedCount: newCitedCount,
          lastSeen: new Date().toISOString(),
          title: sourceData.title
        });

        updatedSources++;
      } else {
        // New source
        const now = new Date().toISOString();
        await setDoc(sourceRef, {
          url: sourceData.url,
          title: sourceData.title,
          type: inferSourceType(sourceData.url, companyUrl),
          citedCount: sourceData.count,
          firstSeen: now,
          lastSeen: now
        });

        newSources++;
      }
    });

    await Promise.all(sourcePromises);

    console.log(`[updateSourcesFromRuns] Processed ${sourceMap.size} sources: ${newSources} new, ${updatedSources} updated`);

    return {
      totalSources: sourceMap.size,
      newSources,
      updatedSources
    };
  } catch (error) {
    console.error("Error updating sources from runs:", error);
    throw error;
  }
};

/**
 * Extract domain from URL
 */
function extractDomain(url) {
  try {
    const urlObj = new URL(url);
    // Get hostname and remove www. prefix
    return urlObj.hostname.replace(/^www\./, '');
  } catch (e) {
    return '';
  }
}

/**
 * Infer source type from URL
 * @param {string} url - The source URL
 * @param {string} companyUrl - The company's URL (optional)
 * @returns {string} - "owned", "social", or "external"
 */
function inferSourceType(url, companyUrl = null) {
  const urlLower = url.toLowerCase();

  // Check if it's an owned source (company's own domain)
  if (companyUrl) {
    const companyDomain = extractDomain(companyUrl);
    const sourceDomain = extractDomain(url);

    if (companyDomain && sourceDomain && sourceDomain === companyDomain) {
      return 'owned';
    }
  }

  // Social media and community platforms
  const socialPlatforms = [
    'reddit.com',
    'twitter.com',
    'x.com',
    'linkedin.com',
    'facebook.com',
    'instagram.com',
    'quora.com',
    'yelp.com',
    'youtube.com',
    'tiktok.com',
    'discord.com',
    'slack.com',
    'medium.com',
    'pinterest.com'
  ];

  for (const platform of socialPlatforms) {
    if (urlLower.includes(platform)) {
      return 'social';
    }
  }

  // Everything else is external
  return 'external';
}
