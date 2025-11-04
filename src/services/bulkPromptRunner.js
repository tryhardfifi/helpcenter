/**
 * Bulk Prompt Runner Service
 *
 * This module contains the business logic for running all prompts and computing analytics.
 * It is intentionally separated from UI and database code to allow easy migration to
 * Firebase Cloud Functions, scheduled jobs, or other backend services.
 *
 * To port to Firebase Functions:
 * 1. Copy this file to your functions/src/ directory
 * 2. Create a scheduled function that runs daily:
 *    exports.dailyPromptRunner = functions.pubsub.schedule('0 0 * * *')
 *      .onRun(async (context) => {
 *        await runAllPromptsAndComputeAnalytics({ companyId, ... });
 *      });
 * 3. Or create a callable function:
 *    exports.runAllPrompts = functions.https.onCall(async (data, context) => {
 *      return await runAllPromptsAndComputeAnalytics(data);
 *    });
 */

import { runPromptAnalysis } from './promptRunner';
import { computeDailyAnalytics } from './analyticsComputation';

/**
 * Run all prompts for a company and then compute analytics
 *
 * @param {Object} params - Parameters for bulk execution
 * @param {string} params.companyId - The company ID
 * @param {string} params.companyName - The company name
 * @param {Array<Object>} params.prompts - Array of prompt objects with {id, text}
 * @param {Array<Object>} params.competitors - Array of competitor objects with {id, name}
 * @param {Function} params.executePromptRunFn - Function to execute a prompt: (promptId, promptData) => Promise
 * @param {Function} params.getAllRunsFn - Function to get all runs: () => Promise<Array>
 * @param {Function} params.saveAnalyticsFn - Function to save analytics: (date, analyticsData) => Promise
 * @param {Function} params.onProgress - Optional callback for progress updates: (message, current, total) => void
 * @returns {Promise<Object>} Results with runs and analytics
 */
export async function runAllPromptsAndComputeAnalytics({
  companyId,
  companyName,
  prompts = [],
  competitors = [],
  executePromptRunFn,
  getAllRunsFn,
  saveAnalyticsFn,
  onProgress = null
}) {
  const results = {
    totalPrompts: prompts.length,
    successfulRuns: 0,
    failedRuns: 0,
    runs: [],
    analytics: null,
    errors: []
  };

  if (prompts.length === 0) {
    throw new Error('No prompts provided to run');
  }

  if (!companyName) {
    throw new Error('Company name is required');
  }

  // Phase 1: Run all prompts using the existing executePromptRun function
  if (onProgress) {
    onProgress('Starting to run all prompts...', 0, prompts.length);
  }

  // Run all prompts in parallel for speed
  const promptPromises = prompts.map(async (prompt, i) => {
    try {
      if (onProgress) {
        onProgress(`Running prompt ${i + 1}/${prompts.length}: "${prompt.text.substring(0, 50)}..."`, i, prompts.length);
      }

      // Use the existing executePromptRun which handles everything:
      // 1. Runs the prompt analysis
      // 2. Saves the run to Firestore
      // 3. Updates the prompt document
      const promptData = {
        text: prompt.text,
        companyName,
        competitors
      };

      const savedRun = await executePromptRunFn(prompt.id, promptData);

      return {
        success: true,
        promptId: prompt.id,
        promptText: prompt.text,
        run: savedRun
      };

    } catch (error) {
      console.error(`Error running prompt ${prompt.id}:`, error);
      return {
        success: false,
        promptId: prompt.id,
        promptText: prompt.text,
        error: error.message
      };
    }
  });

  // Wait for all prompts to complete
  const promptResults = await Promise.all(promptPromises);

  // Process results
  promptResults.forEach(result => {
    if (result.success) {
      results.successfulRuns++;
      results.runs.push(result);
    } else {
      results.failedRuns++;
      results.errors.push({
        promptId: result.promptId,
        promptText: result.promptText,
        error: result.error
      });
      results.runs.push(result);
    }
  });

  if (onProgress) {
    onProgress('All prompts executed. Computing analytics...', prompts.length, prompts.length);
  }

  // Phase 2: Get all runs and compute analytics from them
  try {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];

    // Get all runs that were just created
    const allRuns = await getAllRunsFn();

    // Extract unique competitors from the runs themselves (they may have used default competitors)
    const competitorsFromRuns = new Set();
    allRuns.forEach(run => {
      if (run.competitorMetrics) {
        Object.keys(run.competitorMetrics).forEach(competitorName => {
          competitorsFromRuns.add(competitorName);
        });
      }
    });
    const actualCompetitors = Array.from(competitorsFromRuns).map(name => ({
      id: name.toLowerCase(),
      name
    }));

    console.log('[bulkPromptRunner] Extracted competitors from runs:', actualCompetitors.map(c => c.name));

    // Compute daily analytics from the actual runs with actual competitors
    const dailyAnalytics = computeDailyAnalytics({
      companyId,
      companyName,
      competitors: actualCompetitors,
      allPromptRuns: allRuns,
      date: dateStr
    });

    // Save analytics using the provided save function
    await saveAnalyticsFn(dateStr, dailyAnalytics);

    results.analytics = dailyAnalytics;

    if (onProgress) {
      onProgress('Analytics computed successfully!', prompts.length, prompts.length);
    }

  } catch (error) {
    console.error('Error computing analytics:', error);
    results.errors.push({
      phase: 'analytics',
      error: error.message
    });
  }

  return results;
}

/**
 * Run a single batch of prompts (for rate limiting or chunking)
 *
 * @param {Object} params - Parameters for batch execution
 * @param {string} params.companyName - The company name
 * @param {Array<Object>} params.prompts - Array of prompt objects to run
 * @param {Array<string>} params.competitorNames - Array of competitor names
 * @param {Function} params.saveRunFn - Function to save a run
 * @param {Function} params.onProgress - Optional progress callback
 * @returns {Promise<Array>} Array of saved runs
 */
export async function runPromptBatch({
  companyName,
  prompts = [],
  competitorNames = [],
  saveRunFn,
  onProgress = null
}) {
  const savedRuns = [];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];

    try {
      if (onProgress) {
        onProgress(`Running batch prompt ${i + 1}/${prompts.length}`, i, prompts.length);
      }

      // Run the prompt analysis
      const analysisResult = await runPromptAnalysis({
        promptText: prompt.text,
        companyName,
        competitorNames
      });

      // Save the run
      const savedRun = await saveRunFn(prompt.id, analysisResult);
      savedRuns.push(savedRun);

    } catch (error) {
      console.error(`Error running prompt ${prompt.id}:`, error);
      // Continue with other prompts even if one fails
    }
  }

  return savedRuns;
}

/**
 * Schedule or trigger computation for multiple days (backfill)
 *
 * @param {Object} params - Parameters for backfill
 * @param {string} params.companyId - The company ID
 * @param {string} params.companyName - The company name
 * @param {Array<Object>} params.competitors - Array of competitors
 * @param {Array<Object>} params.allRuns - All runs to use for computation
 * @param {number} params.daysToBackfill - Number of days to backfill
 * @param {Function} params.saveAnalyticsFn - Function to save analytics
 * @param {Function} params.onProgress - Optional progress callback
 * @returns {Promise<Array>} Array of analytics documents created
 */
export async function backfillAnalytics({
  companyId,
  companyName,
  competitors = [],
  allRuns = [],
  daysToBackfill = 7,
  saveAnalyticsFn,
  onProgress = null
}) {
  const analyticsDocuments = [];
  const today = new Date();

  for (let i = daysToBackfill - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    try {
      if (onProgress) {
        onProgress(`Computing analytics for ${dateStr}`, daysToBackfill - i - 1, daysToBackfill);
      }

      // Compute daily analytics
      const dailyAnalytics = computeDailyAnalytics({
        companyId,
        companyName,
        competitors,
        allPromptRuns: allRuns,
        date: dateStr
      });

      // Save analytics
      await saveAnalyticsFn(dateStr, dailyAnalytics);
      analyticsDocuments.push(dailyAnalytics);

    } catch (error) {
      console.error(`Error computing analytics for ${dateStr}:`, error);
    }
  }

  return analyticsDocuments;
}

export default {
  runAllPromptsAndComputeAnalytics,
  runPromptBatch,
  backfillAnalytics
};
