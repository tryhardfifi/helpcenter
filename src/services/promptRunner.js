/**
 * Prompt Runner Service
 *
 * This module contains the business logic for executing prompts and analyzing results.
 * It is intentionally separated from database operations to allow easy migration to
 * Firebase Cloud Functions or other backend services.
 *
 * To port to Firebase Functions:
 * 1. Copy this entire file to your functions/src/ directory
 * 2. Create a callable function that wraps runPromptAnalysis()
 * 3. Update the client to call the Cloud Function instead
 */

/**
 * Execute a prompt and analyze the results
 *
 * @param {Object} params - Parameters for running the prompt
 * @param {string} params.promptText - The prompt text to analyze
 * @param {string} params.companyName - The company name to search for
 * @param {Array<string>} params.competitorNames - List of competitor names (optional)
 * @returns {Promise<Object>} Analysis results
 */
export async function runPromptAnalysis({ promptText, companyName, competitorNames = [] }) {
  // TODO: Replace with actual ChatGPT API calls
  // Future implementation:
  // 1. Call ChatGPT API 10 times with the prompt
  // 2. Parse each response to check if companyName is mentioned
  // 3. Extract ranking position if mentioned (1-10+)
  // 4. Calculate aggregate metrics

  // For now: Generate mock data
  const mockResults = await generateMockAnalysis(companyName, competitorNames);

  return mockResults;
}

/**
 * Generate mock analysis results
 * This simulates what the ChatGPT analysis would return
 *
 * @private
 * @param {string} companyName - The company name being analyzed
 * @param {Array<string>} competitorNames - List of competitor names
 * @returns {Promise<Object>} Mock analysis results
 */
async function generateMockAnalysis(companyName, competitorNames = []) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simulate 10 ChatGPT runs with conversations
  const runs = [];
  for (let i = 0; i < 10; i++) {
    const runData = generateMockConversation(companyName, competitorNames);
    runs.push({
      runNumber: i + 1,
      ...runData
    });
  }

  // Calculate aggregate metrics for our company
  const mentionedRuns = runs.filter(r => r.ourCompany.mentioned);
  const mentionPercentage = (mentionedRuns.length / runs.length) * 100;

  // Calculate average position (only for mentioned runs)
  const averagePosition = mentionedRuns.length > 0
    ? Math.round(mentionedRuns.reduce((sum, r) => sum + r.ourCompany.position, 0) / mentionedRuns.length)
    : null;

  // Calculate competitor metrics
  const competitorMetrics = {};
  competitorNames.forEach(competitor => {
    const competitorMentions = runs.filter(r =>
      r.competitors.some(c => c.name === competitor && c.mentioned)
    );
    const competitorPositions = competitorMentions
      .map(r => r.competitors.find(c => c.name === competitor)?.position)
      .filter(p => p != null);

    competitorMetrics[competitor] = {
      mentionPercentage: (competitorMentions.length / runs.length) * 100,
      averagePosition: competitorPositions.length > 0
        ? Math.round(competitorPositions.reduce((a, b) => a + b, 0) / competitorPositions.length)
        : null,
      mentionedCount: competitorMentions.length
    };
  });

  return {
    mentionPercentage: Math.round(mentionPercentage),
    position: averagePosition,
    totalRuns: runs.length,
    mentionedCount: mentionedRuns.length,
    detailedRuns: runs,
    competitorMetrics,
    analyzedAt: new Date().toISOString()
  };
}

/**
 * Generate a mock conversation with GPT
 *
 * @private
 * @param {string} companyName - Our company name
 * @param {Array<string>} competitorNames - List of competitor names
 * @returns {Object} Mock conversation data
 */
function generateMockConversation(companyName, competitorNames = []) {
  // Randomly decide how many companies to mention (1-5)
  const numToMention = Math.floor(Math.random() * 5) + 1;

  // Pool of all companies
  const allCompanies = [companyName, ...competitorNames];

  // Shuffle and pick companies to mention
  const shuffled = [...allCompanies].sort(() => Math.random() - 0.5);
  const mentionedCompanies = shuffled.slice(0, Math.min(numToMention, allCompanies.length));

  // Assign random positions
  const companyPositions = {};
  mentionedCompanies.forEach((company, idx) => {
    companyPositions[company] = idx + 1;
  });

  // Generate conversation
  const conversation = generateConversationText(mentionedCompanies, companyPositions);

  // Build result structure
  const ourCompany = {
    name: companyName,
    mentioned: mentionedCompanies.includes(companyName),
    position: companyPositions[companyName] || null,
    mentionPercentage: mentionedCompanies.includes(companyName) ? 100 : 0
  };

  const competitors = competitorNames.map(competitor => ({
    name: competitor,
    mentioned: mentionedCompanies.includes(competitor),
    position: companyPositions[competitor] || null,
    mentionPercentage: mentionedCompanies.includes(competitor) ? 100 : 0
  }));

  return {
    conversation,
    ourCompany,
    competitors
  };
}

/**
 * Generate realistic conversation text
 *
 * @private
 * @param {Array<string>} companies - Companies to mention
 * @param {Object} positions - Position map for each company
 * @returns {string} Conversation text
 */
function generateConversationText(companies, positions) {
  const intros = [
    "Based on current market analysis, here are some top recommendations:",
    "After evaluating various options, I'd suggest considering these solutions:",
    "Here are the leading tools in this space:",
    "For this use case, you might want to look at:",
    "The most popular choices in this category are:"
  ];

  const descriptions = [
    "offers a comprehensive feature set and excellent user experience",
    "is known for its robust performance and scalability",
    "provides great value with competitive pricing",
    "stands out with innovative features and strong support",
    "has a proven track record with many satisfied customers",
    "delivers reliable performance with regular updates",
    "excels in ease of use and integration capabilities"
  ];

  let conversation = intros[Math.floor(Math.random() * intros.length)] + "\n\n";

  companies.forEach((company, idx) => {
    const position = positions[company];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    conversation += `${position}. **${company}** - ${description}\n`;
  });

  const outros = [
    "\n\nEach of these options has its strengths, so the best choice depends on your specific needs and requirements.",
    "\n\nI recommend evaluating each based on your specific use case and budget.",
    "\n\nThese are all solid choices that you can't go wrong with.",
    "\n\nConsider trying free trials of these options to see which fits best."
  ];

  conversation += outros[Math.floor(Math.random() * outros.length)];

  return conversation;
}

/**
 * Future implementation with ChatGPT API
 *
 * @example
 * async function callChatGPT(prompt) {
 *   const response = await fetch('https://api.openai.com/v1/chat/completions', {
 *     method: 'POST',
 *     headers: {
 *       'Content-Type': 'application/json',
 *       'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`
 *     },
 *     body: JSON.stringify({
 *       model: 'gpt-4',
 *       messages: [{ role: 'user', content: prompt }],
 *       temperature: 0.7
 *     })
 *   });
 *
 *   return response.json();
 * }
 *
 * async function parseResponseForMention(response, companyName) {
 *   const content = response.choices[0].message.content;
 *
 *   // Check if company is mentioned
 *   const mentioned = content.toLowerCase().includes(companyName.toLowerCase());
 *
 *   if (!mentioned) return { mentioned: false, position: null };
 *
 *   // Extract position using regex or NLP
 *   // Look for patterns like "1. CompanyName", "Top choice: CompanyName", etc.
 *   const position = extractPosition(content, companyName);
 *
 *   return { mentioned: true, position };
 * }
 *
 * function extractPosition(content, companyName) {
 *   // Implementation for extracting ranking position from text
 *   // This would use regex patterns or NLP to find where the company ranks
 *   return null; // placeholder
 * }
 */

export default {
  runPromptAnalysis
};
