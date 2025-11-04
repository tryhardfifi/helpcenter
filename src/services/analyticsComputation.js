/**
 * Analytics Computation Service
 *
 * This module contains the business logic for computing daily analytics from prompt runs.
 * It is intentionally separated from UI code to allow easy migration to
 * Firebase Cloud Functions, scheduled jobs, or other backend services.
 *
 * To port to Firebase Functions:
 * 1. Copy this file to your functions/src/ directory
 * 2. Create a scheduled function that runs daily: exports.computeDailyAnalytics = functions.pubsub.schedule('0 0 * * *')...
 * 3. Or create a callable function: exports.computeAnalytics = functions.https.onCall(computeAnalyticsForCompany)
 */

/**
 * Compute daily analytics for a company based on all prompt runs
 *
 * @param {Object} params - Parameters for analytics computation
 * @param {string} params.companyId - The company ID
 * @param {string} params.companyName - The company name
 * @param {Array<Object>} params.competitors - Array of competitor objects with {id, name}
 * @param {Array<Object>} params.allPromptRuns - Array of all runs from all prompts
 * @param {string} params.date - ISO date string (YYYY-MM-DD) for which to compute analytics
 * @returns {Object} Computed analytics data
 */
export function computeDailyAnalytics({
  companyId,
  companyName,
  competitors = [],
  allPromptRuns = [],
  date
}) {
  if (!allPromptRuns || allPromptRuns.length === 0) {
    return createEmptyAnalytics(companyId, companyName, competitors, date);
  }

  // Compute metrics for the company
  const companyMetrics = computeCompanyMetrics(companyName, allPromptRuns);

  // Compute metrics for each competitor
  const competitorMetrics = {};
  competitors.forEach(competitor => {
    competitorMetrics[competitor.name] = computeCompetitorMetrics(
      competitor.name,
      allPromptRuns
    );
  });

  // Compute visibility score (composite metric)
  const companyVisibilityScore = calculateVisibilityScore(companyMetrics);
  Object.keys(competitorMetrics).forEach(competitorName => {
    competitorMetrics[competitorName].visibilityScore = calculateVisibilityScore(
      competitorMetrics[competitorName]
    );
  });

  return {
    id: date,
    date,
    companyId,
    metrics: {
      company: {
        name: companyName,
        ...companyMetrics,
        visibilityScore: companyVisibilityScore
      },
      competitors: competitorMetrics
    },
    createdAt: date,
    computedAt: new Date().toISOString()
  };
}

/**
 * Compute metrics for the company from all runs
 *
 * @private
 * @param {string} companyName - Company name
 * @param {Array<Object>} allPromptRuns - All runs from all prompts
 * @returns {Object} Company metrics
 */
function computeCompanyMetrics(companyName, allPromptRuns) {
  const totalRuns = allPromptRuns.reduce(
    (sum, run) => sum + (run.detailedRuns?.length || 0),
    0
  );

  // Calculate mentions across all detailed runs
  let totalMentions = 0;
  let totalPositionSum = 0;
  let mentionedRunsCount = 0;

  allPromptRuns.forEach(run => {
    if (run.detailedRuns) {
      run.detailedRuns.forEach(detailedRun => {
        if (detailedRun.ourCompany?.mentioned) {
          totalMentions++;
          if (detailedRun.ourCompany.position) {
            totalPositionSum += detailedRun.ourCompany.position;
            mentionedRunsCount++;
          }
        }
      });
    }
  });

  const mentionRate = totalRuns > 0 ? (totalMentions / totalRuns) * 100 : 0;
  const avgProbability = mentionRate; // For now, probability = mention rate
  const avgRank = mentionedRunsCount > 0 ? totalPositionSum / mentionedRunsCount : null;

  return {
    mentionRate: Math.round(mentionRate * 10) / 10,
    avgProbability: Math.round(avgProbability * 10) / 10,
    avgRank: avgRank ? Math.round(avgRank * 10) / 10 : null,
    promptsRun: allPromptRuns.length,
    totalRuns: totalRuns,
    totalMentions: totalMentions
  };
}

/**
 * Compute metrics for a competitor from all runs
 *
 * @private
 * @param {string} competitorName - Competitor name
 * @param {Array<Object>} allPromptRuns - All runs from all prompts
 * @returns {Object} Competitor metrics
 */
function computeCompetitorMetrics(competitorName, allPromptRuns) {
  const totalRuns = allPromptRuns.reduce(
    (sum, run) => sum + (run.detailedRuns?.length || 0),
    0
  );

  // Calculate mentions across all detailed runs
  let totalMentions = 0;
  let totalPositionSum = 0;
  let mentionedRunsCount = 0;

  allPromptRuns.forEach(run => {
    if (run.detailedRuns) {
      run.detailedRuns.forEach(detailedRun => {
        const competitor = detailedRun.competitors?.find(
          c => c.name === competitorName && c.mentioned
        );
        if (competitor) {
          totalMentions++;
          if (competitor.position) {
            totalPositionSum += competitor.position;
            mentionedRunsCount++;
          }
        }
      });
    }
  });

  const mentionRate = totalRuns > 0 ? (totalMentions / totalRuns) * 100 : 0;
  const avgProbability = mentionRate;
  const avgRank = mentionedRunsCount > 0 ? totalPositionSum / mentionedRunsCount : null;

  return {
    name: competitorName,
    mentionRate: Math.round(mentionRate * 10) / 10,
    avgProbability: Math.round(avgProbability * 10) / 10,
    avgRank: avgRank ? Math.round(avgRank * 10) / 10 : null,
    totalMentions: totalMentions
  };
}

/**
 * Calculate visibility score from metrics
 * Formula: (mentionRate / 100) * (avgProbability / 100) * (10 / avgRank) * 100
 *
 * @private
 * @param {Object} metrics - Metrics object with mentionRate, avgProbability, avgRank
 * @returns {number} Visibility score
 */
function calculateVisibilityScore(metrics) {
  if (!metrics.avgRank) {
    return 0;
  }

  // Normalize rank (better rank = higher score)
  const rankScore = 10 / metrics.avgRank;

  // Combine all factors
  const visibilityScore =
    (metrics.mentionRate / 100) *
    (metrics.avgProbability / 100) *
    rankScore *
    100;

  return Math.round(visibilityScore * 10) / 10;
}

/**
 * Create empty analytics when no data is available
 *
 * @private
 * @param {string} companyId - Company ID
 * @param {string} companyName - Company name
 * @param {Array<Object>} competitors - Array of competitors
 * @param {string} date - ISO date string
 * @returns {Object} Empty analytics object
 */
function createEmptyAnalytics(companyId, companyName, competitors, date) {
  const competitorMetrics = {};
  competitors.forEach(competitor => {
    competitorMetrics[competitor.name] = {
      name: competitor.name,
      visibilityScore: 0,
      mentionRate: 0,
      avgProbability: 0,
      avgRank: null,
      totalMentions: 0
    };
  });

  return {
    id: date,
    date,
    companyId,
    metrics: {
      company: {
        name: companyName,
        visibilityScore: 0,
        mentionRate: 0,
        avgProbability: 0,
        avgRank: null,
        promptsRun: 0,
        totalRuns: 0,
        totalMentions: 0
      },
      competitors: competitorMetrics
    },
    createdAt: date,
    computedAt: new Date().toISOString()
  };
}

/**
 * Compute top sources from all prompt runs
 *
 * @private
 * @param {Array<Object>} allPromptRuns - All runs from all prompts
 * @param {string} companyName - Company name
 * @returns {Array<Object>} Top sources with mention rates and metadata
 */
function computeTopSources(allPromptRuns, companyName) {
  const sourceMap = new Map();
  let totalRunsWithSources = 0;

  // Extract all competitors from runs first
  const allCompetitors = new Set();
  allPromptRuns.forEach(run => {
    if (run.competitorMetrics) {
      Object.keys(run.competitorMetrics).forEach(competitorName => {
        allCompetitors.add(competitorName);
      });
    }
  });

  // Extract sources from all runs
  allPromptRuns.forEach(run => {
    if (!run.detailedRuns) return;

    run.detailedRuns.forEach(detailedRun => {
      if (!detailedRun.sources || detailedRun.sources.length === 0) return;

      totalRunsWithSources++;

      // Track which competitors were mentioned in this run
      const mentionedCompetitors = new Set();

      // Check our company
      if (detailedRun.ourCompany?.mentioned) {
        mentionedCompetitors.add(detailedRun.ourCompany.name);
      }

      // Check all competitors
      if (detailedRun.competitors) {
        detailedRun.competitors.forEach(comp => {
          if (comp.mentioned) {
            mentionedCompetitors.add(comp.name);
          }
        });
      }

      detailedRun.sources.forEach(source => {
        const key = source.url;

        if (!sourceMap.has(key)) {
          const competitorMentions = {};
          allCompetitors.forEach(comp => {
            competitorMentions[comp] = 0;
          });

          sourceMap.set(key, {
            url: source.url,
            title: source.title,
            totalAppearances: 0,
            competitorMentions, // Track mentions per competitor
            type: inferSourceType(source.url)
          });
        }

        const sourceData = sourceMap.get(key);
        sourceData.totalAppearances++;

        // Increment count for each mentioned competitor
        mentionedCompetitors.forEach(competitorName => {
          if (sourceData.competitorMentions[competitorName] !== undefined) {
            sourceData.competitorMentions[competitorName]++;
          }
        });
      });
    });
  });

  if (totalRunsWithSources === 0) {
    return [];
  }

  // Convert to array and calculate metrics per competitor
  const sources = Array.from(sourceMap.values()).map(source => {
    const result = {
      url: source.url,
      title: source.title,
      type: source.type,
      trend: 'stable', // Could be computed from historical data
      totalAppearances: source.totalAppearances,
      competitorMentionCounts: {} // Raw mention counts per competitor
    };

    // Add mention rate for each competitor
    allCompetitors.forEach(competitorName => {
      const compKey = competitorName.replace(/\s+/g, '').charAt(0).toLowerCase() + competitorName.replace(/\s+/g, '').slice(1);
      const mentions = source.competitorMentions[competitorName] || 0;
      const mentionRate = source.totalAppearances > 0
        ? Math.round((mentions / source.totalAppearances) * 100)
        : 0;

      result[compKey] = mentionRate;
      result.competitorMentionCounts[compKey] = mentions;
    });

    // Calculate percentage (share of total appearances)
    result.percentage = Math.round((source.totalAppearances / totalRunsWithSources) * 100);

    return result;
  });

  // Sort by first competitor's mention rate (descending) and take top 20
  const firstCompetitor = Array.from(allCompetitors)[0];
  const firstCompKey = firstCompetitor
    ? firstCompetitor.replace(/\s+/g, '').charAt(0).toLowerCase() + firstCompetitor.replace(/\s+/g, '').slice(1)
    : null;

  return sources
    .sort((a, b) => {
      if (firstCompKey) {
        return (b[firstCompKey] || 0) - (a[firstCompKey] || 0);
      }
      return 0;
    })
    .slice(0, 20);
}

/**
 * Infer source type from URL
 *
 * @private
 * @param {string} url - Source URL
 * @param {string} companyDomain - Company's own domain (optional)
 * @returns {string} Source type
 */
function inferSourceType(url, companyDomain = null) {
  const urlLower = url.toLowerCase();

  // Check if it's an owned source (company's own domain)
  if (companyDomain && urlLower.includes(companyDomain.toLowerCase())) {
    return 'own';
  }

  // Social media platforms
  if (urlLower.includes('reddit.com') || urlLower.includes('twitter.com') || urlLower.includes('x.com') || urlLower.includes('linkedin.com')) {
    return 'reddit';
  }

  // News and publication sites
  if (urlLower.includes('news') || urlLower.includes('techcrunch') || urlLower.includes('forbes') ||
      urlLower.includes('producthunt') || urlLower.includes('ycombinator') || urlLower.includes('medium')) {
    return 'publication';
  }

  // Default to publication for third-party sites
  return 'publication';
}

/**
 * Create padded documents with zero values for previous days
 * This helps visualization when there's only one data point
 *
 * @private
 * @param {Object} currentDoc - The current analytics document
 * @param {string} companyName - Company name
 * @param {Array<string>} competitorNames - List of competitor names
 * @returns {Array<Object>} Array of padded documents (4 previous days + current)
 */
function createPaddedDocuments(currentDoc, companyName, competitorNames) {
  const paddedDocs = [];
  const currentDate = new Date(currentDoc.date);

  // Create 4 previous days with zero values
  for (let i = 4; i >= 1; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const competitorMetrics = {};
    competitorNames.forEach(competitor => {
      competitorMetrics[competitor] = {
        name: competitor,
        visibilityScore: 0,
        mentionRate: 0,
        avgProbability: 0,
        avgRank: null,
        totalMentions: 0
      };
    });

    paddedDocs.push({
      id: dateStr,
      date: dateStr,
      companyId: currentDoc.companyId,
      metrics: {
        company: {
          name: companyName,
          visibilityScore: 0,
          mentionRate: 0,
          avgProbability: 0,
          avgRank: null,
          promptsRun: 0,
          totalRuns: 0,
          totalMentions: 0
        },
        competitors: competitorMetrics
      },
      createdAt: dateStr,
      computedAt: new Date().toISOString()
    });
  }

  // Add the current document
  paddedDocs.push(currentDoc);

  return paddedDocs;
}

/**
 * Aggregate analytics over a time period to create time-series data
 *
 * @param {Array<Object>} analyticsDocuments - Array of daily analytics documents
 * @param {string} companyName - Company name (for formatting)
 * @param {Array<string>} competitorNames - List of competitor names
 * @param {Array<Object>} allPromptRuns - All prompt runs (optional, used to compute sources)
 * @returns {Object} Aggregated time-series data
 */
export function aggregateAnalyticsForDashboard(analyticsDocuments, companyName, competitorNames, allPromptRuns = []) {
  // Sort by date
  const sortedDocs = [...analyticsDocuments].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // If we only have one data point, add 4 previous days with zero values for better visualization
  const shouldPadData = sortedDocs.length === 1;
  const paddedDocs = shouldPadData ? createPaddedDocuments(sortedDocs[0], companyName, competitorNames) : sortedDocs;

  const visibilityScoreOverTime = [];
  const mentionsOverTime = [];
  const avgProbabilityOverTime = [];
  const rankingsOverTime = [];

  // Format company name for property keys (lowercase, no spaces)
  const companyKey = formatNameForKey(companyName);
  const competitorKeys = competitorNames.map(name => formatNameForKey(name));

  paddedDocs.forEach(doc => {
    const dateLabel = formatDateLabel(doc.date);

    // Visibility Score
    const visibilityEntry = { date: dateLabel };
    visibilityEntry[companyKey] = doc.metrics.company.visibilityScore;
    competitorNames.forEach(competitor => {
      const key = formatNameForKey(competitor);
      visibilityEntry[key] = doc.metrics.competitors[competitor]?.visibilityScore || 0;
    });
    visibilityScoreOverTime.push(visibilityEntry);

    // Mentions
    const mentionsEntry = { date: dateLabel };
    mentionsEntry[companyKey] = doc.metrics.company.mentionRate;
    competitorNames.forEach(competitor => {
      const key = formatNameForKey(competitor);
      mentionsEntry[key] = doc.metrics.competitors[competitor]?.mentionRate || 0;
    });
    mentionsOverTime.push(mentionsEntry);

    // Probability
    const probabilityEntry = { date: dateLabel };
    probabilityEntry[companyKey] = doc.metrics.company.avgProbability;
    competitorNames.forEach(competitor => {
      const key = formatNameForKey(competitor);
      probabilityEntry[key] = doc.metrics.competitors[competitor]?.avgProbability || 0;
    });
    avgProbabilityOverTime.push(probabilityEntry);

    // Rankings
    const rankingsEntry = { date: dateLabel };
    rankingsEntry[companyKey] = doc.metrics.company.avgRank || 0;
    competitorNames.forEach(competitor => {
      const key = formatNameForKey(competitor);
      rankingsEntry[key] = doc.metrics.competitors[competitor]?.avgRank || 0;
    });
    rankingsOverTime.push(rankingsEntry);
  });

  // Get latest metrics
  const latestDoc = sortedDocs[sortedDocs.length - 1];
  const latestMetrics = latestDoc ? {
    visibilityScore: latestDoc.metrics.company.visibilityScore,
    promptCoverage: latestDoc.metrics.company.mentionRate,
    avgProbability: latestDoc.metrics.company.avgProbability,
    avgRank: latestDoc.metrics.company.avgRank || 0,
    totalMentions: latestDoc.metrics.company.totalMentions || 0,
    totalRuns: latestDoc.metrics.company.totalRuns || 0
  } : {
    visibilityScore: 0,
    promptCoverage: 0,
    avgProbability: 0,
    avgRank: 0,
    totalMentions: 0,
    totalRuns: 0
  };

  // Compute top sources if runs are provided
  const topSources = allPromptRuns.length > 0
    ? computeTopSources(allPromptRuns, companyName)
    : [];

  // Store the list of competitors for easy access
  const competitors = competitorNames.map(name => ({
    id: name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: name
  }));

  return {
    metrics: latestMetrics,
    visibilityScoreOverTime,
    mentionsOverTime,
    avgProbabilityOverTime,
    rankingsOverTime,
    topSources,
    competitors
  };
}

/**
 * Format a name for use as an object key (lowercase, camelCase)
 *
 * @private
 * @param {string} name - Name to format
 * @returns {string} Formatted key
 */
function formatNameForKey(name) {
  // Convert "Acme Inc." to "acme" or "CompetitorCo" to "competitorCo"
  return name
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^./, str => str.toLowerCase());
}

/**
 * Format date for display (e.g., "2024-06-01" to "Jun 1")
 *
 * @private
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date label
 */
function formatDateLabel(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default {
  computeDailyAnalytics,
  aggregateAnalyticsForDashboard
};
