import { db } from '../lib/firebase';
import { doc, setDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';

/**
 * Fetches website content using a CORS proxy
 * @param {string} url - The website URL to fetch
 * @returns {Promise<string>} The HTML content of the website
 */
const fetchWebsiteContent = async (url) => {
  try {
    // Fetch the website directly
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    return html;
  } catch (error) {
    // If CORS fails, try with a proxy
    console.log('Direct fetch failed, trying with proxy...', error.message);
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) {
        throw new Error('Proxy fetch also failed');
      }

      return await response.text();
    } catch (proxyError) {
      throw new Error(`Unable to fetch website content. Please ensure the URL is correct and accessible. Error: ${error.message}`);
    }
  }
};

/**
 * Extracts meaningful text from HTML content
 * @param {string} html - The HTML content
 * @returns {string} Extracted text content
 */
const extractTextFromHtml = (html) => {
  // Create a temporary DOM element to parse HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Remove script, style, and other non-content elements
  const elementsToRemove = doc.querySelectorAll('script, style, noscript, iframe, nav, footer');
  elementsToRemove.forEach(el => el.remove());

  // Get text content
  let text = doc.body?.textContent || doc.documentElement?.textContent || '';

  // Clean up the text
  text = text
    .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
    .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
    .trim();

  // Limit to first 8000 characters to avoid token limits
  return text.substring(0, 8000);
};

/**
 * Fetches company information from a URL using OpenAI GPT-4
 * @param {string} url - The company website URL
 * @returns {Promise<Object>} Company information object
 */
export const fetchCompanyInfoFromUrl = async (url) => {
  try {
    // Ensure URL has protocol
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    }

    // Fetch the actual website content
    console.log('Fetching website content from:', normalizedUrl);
    const html = await fetchWebsiteContent(normalizedUrl);
    const websiteText = extractTextFromHtml(html);

    if (!websiteText || websiteText.length < 100) {
      throw new Error('Unable to extract meaningful content from the website. Please try a different URL.');
    }

    console.log('Extracted website text length:', websiteText.length);

    const prompt = `Based on the following website content, extract company information:

WEBSITE CONTENT:
${websiteText}

Extract the following information:
- Official company name
- Primary industry/sector
- Brief company description (2-3 sentences based on what they actually do)
- Main products or services offered (as an array)
- Target audience/customer base
- Company size (employees) if mentioned
- Headquarters location if mentioned
- Year founded if mentioned

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "companyName": "Example Corp",
  "industry": "SaaS / Customer Support",
  "description": "Example Corp provides AI-powered customer support solutions...",
  "products": ["Product A", "Product B"],
  "targetAudience": "Small to medium-sized businesses",
  "companySize": "50-200 employees",
  "headquarters": "San Francisco, CA",
  "yearFounded": "2020",
  "websiteUrl": "${normalizedUrl}"
}

If any information is not found in the content, use "Not available" as the value. Make sure to base your response on the actual content, not assumptions.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that extracts company information from website content. Always return valid JSON without any markdown formatting or code blocks. Be accurate and only extract information that is actually present in the content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to fetch company information from OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    let companyInfo;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      companyInfo = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON:', content);
      throw new Error('Failed to parse company information from AI response');
    }

    // Validate required fields
    if (!companyInfo.companyName || companyInfo.companyName === 'Not available') {
      throw new Error('Could not extract company name from website. Please check the URL and try again.');
    }

    return companyInfo;
  } catch (error) {
    console.error('Error fetching company info:', error);
    throw error;
  }
};

/**
 * Generates discovery prompts based on company information using OpenAI
 * @param {Object} companyInfo - Company information object
 * @returns {Promise<Array<string>>} Array of 10 discovery prompts
 */
export const generateDiscoveryPrompts = async (companyInfo) => {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Based on the following company information:
- Company Name: ${companyInfo.companyName}
- Industry: ${companyInfo.industry}
- Description: ${companyInfo.description}
- Products/Services: ${Array.isArray(companyInfo.products) ? companyInfo.products.join(', ') : companyInfo.products}
- Target Audience: ${companyInfo.targetAudience}

Generate 10 search prompts that potential customers might ask ChatGPT when looking for solutions this company provides. Format them as questions someone would naturally ask.

Examples:
- "What is the best CRM for small businesses?"
- "How can I automate customer support?"
- "What are the top help desk software options?"

Return ONLY a JSON array of strings, like this:
["prompt 1", "prompt 2", "prompt 3", ...]

Make the prompts specific to the industry and problems this company solves.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates relevant search prompts. Always return valid JSON arrays.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to generate prompts from OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON from response
    let prompts;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      prompts = JSON.parse(jsonString);
    } catch (parseError) {
      throw new Error('Failed to parse prompts from AI response');
    }

    // Validate that we got an array
    if (!Array.isArray(prompts)) {
      throw new Error('AI did not return a valid array of prompts');
    }

    // Ensure we have exactly 10 prompts
    if (prompts.length < 10) {
      console.warn(`Only received ${prompts.length} prompts, expected 10`);
    }

    return prompts.slice(0, 10); // Return first 10 prompts
  } catch (error) {
    console.error('Error generating prompts:', error);
    throw error;
  }
};

/**
 * Creates a company document in Firestore with the extracted information
 * @param {Object} companyData - Company information from AI extraction
 * @param {string} userEmail - Email of the user creating the company
 * @returns {Promise<string>} The created company ID
 */
export const createCompanyDocument = async (companyData, userEmail) => {
  try {
    // Generate unique company ID
    const companyId = `company-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const companyRef = doc(db, 'companies', companyId);

    // Create company document with full structure
    const companyDoc = {
      id: companyId,
      name: companyData.companyName,
      website: companyData.websiteUrl,
      industry: companyData.industry || 'Not specified',
      description: companyData.description || '',
      products: companyData.products || [],
      targetAudience: companyData.targetAudience || '',
      companySize: companyData.companySize || '',
      headquarters: companyData.headquarters || '',
      yearFounded: companyData.yearFounded || '',
      logo: null,
      members: [userEmail],
      createdAt: new Date().toISOString(),
      subscription: {
        plan: 'starter',
        status: 'active',
        price: 0,
        billingPeriod: 'monthly',
        startDate: new Date().toISOString(),
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        limits: {
          answerEngines: 3,
          promptsTracked: 50,
          articlesPerMonth: 10,
          competitorsTracked: 5
        },
        features: {
          advancedAnalytics: false,
          prioritySupport: false,
          exportData: false,
          apiAccess: false
        }
      }
    };

    await setDoc(companyRef, companyDoc);

    // Update user document with companyId
    const userRef = doc(db, 'users', userEmail);
    await setDoc(userRef, {
      companyId,
      onboardingCompleted: true,
      onboardingCompletedAt: new Date().toISOString()
    }, { merge: true });

    console.log('Company document created:', companyId);
    return companyId;
  } catch (error) {
    console.error('Error creating company document:', error);
    throw new Error('Failed to create company in database: ' + error.message);
  }
};

/**
 * Creates initial discovery prompts in Firestore for a company
 * @param {string} companyId - The company ID
 * @param {Array<string>} prompts - Array of prompt strings
 * @returns {Promise<void>}
 */
export const createInitialPrompts = async (companyId, prompts) => {
  try {
    const batch = writeBatch(db);
    const now = new Date().toISOString();

    prompts.forEach(promptText => {
      const promptRef = doc(collection(db, 'companies', companyId, 'prompts'));
      batch.set(promptRef, {
        text: promptText,
        mentionRate: 0,
        totalMentions: 0,
        createdAt: now,
        lastUpdated: now,
        category: 'discovery',
        aiGenerated: true,
        source: 'onboarding',
        analytics: {
          mentionsOverTime: [],
          rankingsOverTime: [],
          averagePosition: null,
          coMentions: []
        }
      });
    });

    await batch.commit();
    console.log(`Created ${prompts.length} initial prompts for company ${companyId}`);
  } catch (error) {
    console.error('Error creating prompts:', error);
    throw new Error('Failed to create prompts in database: ' + error.message);
  }
};

/**
 * Complete onboarding flow - orchestrates all steps
 * @param {string} url - Company website URL
 * @param {string} userEmail - User's email
 * @returns {Promise<Object>} Object with companyId and success status
 */
export const completeOnboarding = async (url, userEmail) => {
  try {
    // Step 1: Fetch company info from URL
    console.log('Fetching company info from URL...');
    const companyInfo = await fetchCompanyInfoFromUrl(url);

    // Step 2: Generate discovery prompts
    console.log('Generating discovery prompts...');
    const prompts = await generateDiscoveryPrompts(companyInfo);

    // Step 3: Create company document
    console.log('Creating company document...');
    const companyId = await createCompanyDocument(companyInfo, userEmail);

    // Step 4: Create initial prompts
    console.log('Creating initial prompts...');
    await createInitialPrompts(companyId, prompts);

    return {
      success: true,
      companyId,
      companyName: companyInfo.companyName,
      promptCount: prompts.length
    };
  } catch (error) {
    console.error('Onboarding flow error:', error);
    throw error;
  }
};
