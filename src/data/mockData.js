// This mirrors the Firestore structure: companies/{companyId}
export const mockCompanyData = {
  companyId: "acme-inc-123",

  // Company document data (companies/acme-inc-123)
  company: {
    id: "acme-inc-123",
    name: "Acme Inc.",
    logo: null,
    website: "acme.com",
    industry: "B2B SaaS",
    createdAt: "2024-01-01",
    subscription: {
      plan: "pro", // "free" or "pro"
      status: "active",
      price: 100,
    },
    competitors: [
      { id: "comp-1", name: "CompetitorCo" },
      { id: "comp-2", name: "RivalTech" },
      { id: "comp-3", name: "IndustryCorp" },
    ],
    // Dashboard analytics (stored at company level)
    analytics: {
      metrics: {
        totalMentions: 1247,
        growth: 23.4,
        currentRanking: 2,
        topPage: "acme.com/product",
      },
      mentionsOverTime: [
        { date: "Jan", acme: 45, competitorCo: 35, rivalTech: 12, industryCorp: 8 },
        { date: "Feb", acme: 52, competitorCo: 38, rivalTech: 15, industryCorp: 10 },
        { date: "Mar", acme: 61, competitorCo: 42, rivalTech: 18, industryCorp: 12 },
        { date: "Apr", acme: 58, competitorCo: 45, rivalTech: 22, industryCorp: 15 },
        { date: "May", acme: 72, competitorCo: 48, rivalTech: 25, industryCorp: 18 },
        { date: "Jun", acme: 85, competitorCo: 52, rivalTech: 28, industryCorp: 20 },
      ],
      rankingsOverTime: [
        { date: "Jan", acme: 3, competitorCo: 1, rivalTech: 5, industryCorp: 8 },
        { date: "Feb", acme: 3, competitorCo: 2, rivalTech: 5, industryCorp: 7 },
        { date: "Mar", acme: 2, competitorCo: 1, rivalTech: 4, industryCorp: 6 },
        { date: "Apr", acme: 2, competitorCo: 1, rivalTech: 4, industryCorp: 7 },
        { date: "May", acme: 2, competitorCo: 1, rivalTech: 3, industryCorp: 5 },
        { date: "Jun", acme: 2, competitorCo: 1, rivalTech: 3, industryCorp: 6 },
      ],
      topPages: [
        { url: "acme.com/product", mentions: 456, percentage: 36.5, trend: "up" },
        { url: "acme.com/about", mentions: 234, percentage: 18.7, trend: "up" },
        { url: "acme.com/blog/ai-tools", mentions: 189, percentage: 15.1, trend: "stable" },
        { url: "acme.com/pricing", mentions: 145, percentage: 11.6, trend: "down" },
        { url: "acme.com/case-studies", mentions: 123, percentage: 9.8, trend: "up" },
      ],
    },
  },

  // Prompts subcollection (companies/acme-inc-123/prompts)
  prompts: [
    {
      id: "prompt-1",
      companyId: "acme-inc-123",
      text: "What are the best project management tools for startups?",
      totalMentions: 234,
      trend: "up",
      createdAt: "2024-01-10",
      lastUpdated: "2024-03-15",
      analytics: {
        mentionsOverTime: [
          { date: "Jan", acme: 35, competitorCo: 45, rivalTech: 10, industryCorp: 5 },
          { date: "Feb", acme: 42, competitorCo: 48, rivalTech: 12, industryCorp: 8 },
          { date: "Mar", acme: 48, competitorCo: 50, rivalTech: 15, industryCorp: 10 },
          { date: "Apr", acme: 55, competitorCo: 52, rivalTech: 18, industryCorp: 12 },
          { date: "May", acme: 62, competitorCo: 55, rivalTech: 20, industryCorp: 15 },
          { date: "Jun", acme: 70, competitorCo: 58, rivalTech: 22, industryCorp: 18 },
        ],
        rankingsOverTime: [
          { date: "Jan", acme: 2, competitorCo: 1, rivalTech: 4, industryCorp: 6 },
          { date: "Feb", acme: 2, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "Mar", acme: 1, competitorCo: 2, rivalTech: 3, industryCorp: 5 },
          { date: "Apr", acme: 1, competitorCo: 2, rivalTech: 3, industryCorp: 6 },
          { date: "May", acme: 1, competitorCo: 2, rivalTech: 3, industryCorp: 4 },
          { date: "Jun", acme: 1, competitorCo: 2, rivalTech: 3, industryCorp: 5 },
        ],
        averagePosition: 1.5,
        sentiment: "positive",
        coMentions: ["CompetitorCo", "RivalTech"],
      },
    },
    {
      id: "prompt-2",
      companyId: "acme-inc-123",
      text: "Compare enterprise software solutions for team collaboration",
      totalMentions: 189,
      trend: "up",
      createdAt: "2024-01-12",
      lastUpdated: "2024-03-14",
      analytics: {
        mentionsOverTime: [
          { date: "Jan", acme: 28, competitorCo: 40, rivalTech: 15, industryCorp: 10 },
          { date: "Feb", acme: 32, competitorCo: 42, rivalTech: 18, industryCorp: 12 },
          { date: "Mar", acme: 38, competitorCo: 45, rivalTech: 20, industryCorp: 15 },
          { date: "Apr", acme: 42, competitorCo: 48, rivalTech: 22, industryCorp: 18 },
          { date: "May", acme: 48, competitorCo: 50, rivalTech: 25, industryCorp: 20 },
          { date: "Jun", acme: 55, competitorCo: 52, rivalTech: 28, industryCorp: 22 },
        ],
        rankingsOverTime: [
          { date: "Jan", acme: 3, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "Feb", acme: 2, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "Mar", acme: 2, competitorCo: 1, rivalTech: 3, industryCorp: 5 },
          { date: "Apr", acme: 2, competitorCo: 1, rivalTech: 3, industryCorp: 4 },
          { date: "May", acme: 2, competitorCo: 1, rivalTech: 3, industryCorp: 4 },
          { date: "Jun", acme: 1, competitorCo: 2, rivalTech: 3, industryCorp: 4 },
        ],
        averagePosition: 2.0,
        sentiment: "positive",
        coMentions: ["CompetitorCo", "RivalTech", "IndustryCorp"],
      },
    },
    {
      id: "prompt-3",
      companyId: "acme-inc-123",
      text: "Which companies offer AI-powered analytics?",
      totalMentions: 156,
      trend: "stable",
      createdAt: "2024-01-15",
      lastUpdated: "2024-03-13",
      analytics: {
        mentionsOverTime: [
          { date: "Jan", acme: 25, competitorCo: 30, rivalTech: 20, industryCorp: 15 },
          { date: "Feb", acme: 26, competitorCo: 31, rivalTech: 22, industryCorp: 16 },
          { date: "Mar", acme: 27, competitorCo: 32, rivalTech: 23, industryCorp: 17 },
          { date: "Apr", acme: 26, competitorCo: 33, rivalTech: 24, industryCorp: 18 },
          { date: "May", acme: 28, competitorCo: 34, rivalTech: 25, industryCorp: 19 },
          { date: "Jun", acme: 27, competitorCo: 35, rivalTech: 26, industryCorp: 20 },
        ],
        rankingsOverTime: [
          { date: "Jan", acme: 3, competitorCo: 2, rivalTech: 4, industryCorp: 5 },
          { date: "Feb", acme: 3, competitorCo: 2, rivalTech: 4, industryCorp: 5 },
          { date: "Mar", acme: 3, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "Apr", acme: 3, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "May", acme: 3, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "Jun", acme: 3, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
        ],
        averagePosition: 3.0,
        sentiment: "neutral",
        coMentions: ["CompetitorCo", "RivalTech", "IndustryCorp"],
      },
    },
    {
      id: "prompt-4",
      companyId: "acme-inc-123",
      text: "Best B2B SaaS tools for productivity",
      totalMentions: 198,
      trend: "up",
      createdAt: "2024-01-18",
      lastUpdated: "2024-03-12",
      analytics: {
        mentionsOverTime: [
          { date: "Jan", acme: 30, competitorCo: 38, rivalTech: 14, industryCorp: 8 },
          { date: "Feb", acme: 35, competitorCo: 40, rivalTech: 16, industryCorp: 10 },
          { date: "Mar", acme: 40, competitorCo: 42, rivalTech: 18, industryCorp: 12 },
          { date: "Apr", acme: 45, competitorCo: 44, rivalTech: 20, industryCorp: 14 },
          { date: "May", acme: 50, competitorCo: 46, rivalTech: 22, industryCorp: 16 },
          { date: "Jun", acme: 58, competitorCo: 48, rivalTech: 24, industryCorp: 18 },
        ],
        rankingsOverTime: [
          { date: "Jan", acme: 2, competitorCo: 1, rivalTech: 4, industryCorp: 6 },
          { date: "Feb", acme: 2, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "Mar", acme: 2, competitorCo: 1, rivalTech: 3, industryCorp: 5 },
          { date: "Apr", acme: 2, competitorCo: 1, rivalTech: 3, industryCorp: 5 },
          { date: "May", acme: 1, competitorCo: 2, rivalTech: 3, industryCorp: 4 },
          { date: "Jun", acme: 1, competitorCo: 2, rivalTech: 3, industryCorp: 4 },
        ],
        averagePosition: 1.7,
        sentiment: "positive",
        coMentions: ["CompetitorCo", "RivalTech"],
      },
    },
    {
      id: "prompt-5",
      companyId: "acme-inc-123",
      text: "Top-rated business intelligence platforms",
      totalMentions: 167,
      trend: "down",
      createdAt: "2024-01-20",
      lastUpdated: "2024-03-11",
      analytics: {
        mentionsOverTime: [
          { date: "Jan", acme: 35, competitorCo: 32, rivalTech: 18, industryCorp: 12 },
          { date: "Feb", acme: 33, competitorCo: 34, rivalTech: 20, industryCorp: 14 },
          { date: "Mar", acme: 30, competitorCo: 36, rivalTech: 22, industryCorp: 16 },
          { date: "Apr", acme: 28, competitorCo: 38, rivalTech: 24, industryCorp: 18 },
          { date: "May", acme: 26, competitorCo: 40, rivalTech: 26, industryCorp: 20 },
          { date: "Jun", acme: 24, competitorCo: 42, rivalTech: 28, industryCorp: 22 },
        ],
        rankingsOverTime: [
          { date: "Jan", acme: 2, competitorCo: 3, rivalTech: 4, industryCorp: 5 },
          { date: "Feb", acme: 2, competitorCo: 3, rivalTech: 4, industryCorp: 5 },
          { date: "Mar", acme: 3, competitorCo: 2, rivalTech: 4, industryCorp: 5 },
          { date: "Apr", acme: 3, competitorCo: 2, rivalTech: 4, industryCorp: 5 },
          { date: "May", acme: 3, competitorCo: 1, rivalTech: 4, industryCorp: 5 },
          { date: "Jun", acme: 4, competitorCo: 1, rivalTech: 3, industryCorp: 5 },
        ],
        averagePosition: 2.8,
        sentiment: "neutral",
        coMentions: ["CompetitorCo", "RivalTech", "IndustryCorp"],
      },
    },
  ],

  // Articles subcollection (companies/acme-inc-123/articles)
  articles: [
    {
      id: "article-1",
      companyId: "acme-inc-123",
      title: "The Future of Team Collaboration: AI-Powered Solutions",
      url: "acme.com/blog/future-of-collaboration",
      publishDate: "2024-01-15",
      createdAt: "2024-01-15",
      mentions: 89,
      impact: "high",
      topics: ["AI", "Collaboration", "Productivity"],
    },
    {
      id: "article-2",
      companyId: "acme-inc-123",
      title: "How Acme Inc. Revolutionized Project Management",
      url: "acme.com/case-studies/revolution",
      publishDate: "2024-02-01",
      createdAt: "2024-02-01",
      mentions: 67,
      impact: "medium",
      topics: ["Project Management", "Case Study"],
    },
    {
      id: "article-3",
      companyId: "acme-inc-123",
      title: "10 Ways AI is Transforming Business Intelligence",
      url: "acme.com/blog/ai-transformation",
      publishDate: "2024-02-15",
      createdAt: "2024-02-15",
      mentions: 54,
      impact: "medium",
      topics: ["AI", "Business Intelligence", "Analytics"],
    },
    {
      id: "article-4",
      companyId: "acme-inc-123",
      title: "Customer Success Stories: Enterprise Edition",
      url: "acme.com/case-studies/enterprise",
      publishDate: "2024-03-01",
      createdAt: "2024-03-01",
      mentions: 45,
      impact: "low",
      topics: ["Case Study", "Enterprise", "Customer Success"],
    },
  ],
};

// Helper functions to access data (simulates Firestore queries)
export const getCompany = (companyId) => {
  if (companyId === mockCompanyData.companyId) {
    return mockCompanyData.company;
  }
  return null;
};

export const getCompanyPrompts = (companyId) => {
  if (companyId === mockCompanyData.companyId) {
    return mockCompanyData.prompts;
  }
  return [];
};

export const getPromptById = (companyId, promptId) => {
  if (companyId === mockCompanyData.companyId) {
    return mockCompanyData.prompts.find(p => p.id === promptId);
  }
  return null;
};

export const getCompanyArticles = (companyId) => {
  if (companyId === mockCompanyData.companyId) {
    return mockCompanyData.articles;
  }
  return [];
};

export const getArticleById = (companyId, articleId) => {
  if (companyId === mockCompanyData.companyId) {
    return mockCompanyData.articles.find(a => a.id === articleId);
  }
  return null;
};
