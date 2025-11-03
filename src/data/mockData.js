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
      plan: "growth", // "starter", "growth", or "enterprise"
      status: "active",
      price: 399,
      billingPeriod: "monthly",
      startDate: "2024-01-01",
      nextBillingDate: "2024-12-01",
      limits: {
        answerEngines: 5,
        promptsTracked: 100,
        articlesPerMonth: 6,
        competitorsTracked: 3,
      },
      features: {
        advancedAnalytics: true,
        prioritySupport: true,
        exportData: true,
        apiAccess: false,
      },
    },
    competitors: [
      { id: "comp-1", name: "CompetitorCo" },
      { id: "comp-2", name: "RivalTech" },
      { id: "comp-3", name: "IndustryCorp" },
    ],
    // Dashboard analytics (stored at company level)
    analytics: {
      metrics: {
        visibilityScore: 82.5, // prompt coverage × avg. probability × avg. rank
        promptCoverage: 72.4, // % of tracked prompts where company appears
        avgProbability: 68.3, // average % chance of appearing in results
        avgRank: 2.1, // average position when mentioned
      },
      visibilityScoreOverTime: [
        { date: "Jan", acme: 65.3, competitorCo: 85.2, rivalTech: 48.5, industryCorp: 38.7 },
        { date: "Feb", acme: 68.9, competitorCo: 86.8, rivalTech: 51.3, industryCorp: 41.2 },
        { date: "Mar", acme: 73.5, competitorCo: 88.4, rivalTech: 54.8, industryCorp: 44.6 },
        { date: "Apr", acme: 76.2, competitorCo: 89.7, rivalTech: 58.2, industryCorp: 47.9 },
        { date: "May", acme: 79.8, competitorCo: 91.3, rivalTech: 61.7, industryCorp: 51.3 },
        { date: "Jun", acme: 82.5, competitorCo: 92.8, rivalTech: 65.4, industryCorp: 54.8 },
      ],
      mentionsOverTime: [
        { date: "Jan", acme: 45.2, competitorCo: 68.5, rivalTech: 32.1, industryCorp: 28.3 },
        { date: "Feb", acme: 52.8, competitorCo: 71.2, rivalTech: 35.4, industryCorp: 30.1 },
        { date: "Mar", acme: 61.3, competitorCo: 74.8, rivalTech: 38.2, industryCorp: 32.5 },
        { date: "Apr", acme: 58.9, competitorCo: 76.3, rivalTech: 41.7, industryCorp: 35.2 },
        { date: "May", acme: 65.7, competitorCo: 78.9, rivalTech: 44.3, industryCorp: 37.8 },
        { date: "Jun", acme: 72.4, competitorCo: 81.2, rivalTech: 47.5, industryCorp: 40.6 },
      ],
      avgProbabilityOverTime: [
        { date: "Jan", acme: 52.4, competitorCo: 78.6, rivalTech: 45.2, industryCorp: 38.9 },
        { date: "Feb", acme: 56.8, competitorCo: 79.3, rivalTech: 48.7, industryCorp: 41.5 },
        { date: "Mar", acme: 60.5, competitorCo: 80.9, rivalTech: 52.3, industryCorp: 44.8 },
        { date: "Apr", acme: 63.2, competitorCo: 82.1, rivalTech: 55.6, industryCorp: 47.6 },
        { date: "May", acme: 66.1, competitorCo: 83.7, rivalTech: 58.9, industryCorp: 50.3 },
        { date: "Jun", acme: 68.3, competitorCo: 85.2, rivalTech: 62.4, industryCorp: 53.1 },
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
        { url: "acme.com/product", mentionRate: 45.6, percentage: 36.5, trend: "up" },
        { url: "acme.com/about", mentionRate: 23.4, percentage: 18.7, trend: "up" },
        { url: "acme.com/blog/ai-tools", mentionRate: 18.9, percentage: 15.1, trend: "stable" },
        { url: "acme.com/pricing", mentionRate: 14.5, percentage: 11.6, trend: "down" },
        { url: "acme.com/case-studies", mentionRate: 12.3, percentage: 9.8, trend: "up" },
      ],
    },
  },

  // Prompts subcollection (companies/acme-inc-123/prompts)
  prompts: [
    {
      id: "prompt-1",
      companyId: "acme-inc-123",
      text: "What are the best project management tools for startups?",
      mentionRate: 70.0,
      trend: "up",
      createdAt: "2024-01-10",
      lastUpdated: "2024-03-15",
      analytics: {
        mentionsOverTime: [
          { date: "Jan", acme: 35.2, competitorCo: 78.5, rivalTech: 24.3, industryCorp: 15.8 },
          { date: "Feb", acme: 42.1, competitorCo: 80.2, rivalTech: 28.5, industryCorp: 19.4 },
          { date: "Mar", acme: 48.6, competitorCo: 82.8, rivalTech: 32.7, industryCorp: 23.1 },
          { date: "Apr", acme: 55.3, competitorCo: 84.5, rivalTech: 36.9, industryCorp: 26.8 },
          { date: "May", acme: 62.7, competitorCo: 86.2, rivalTech: 41.2, industryCorp: 30.5 },
          { date: "Jun", acme: 70.0, competitorCo: 88.0, rivalTech: 45.6, industryCorp: 34.2 },
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
      mentionRate: 55.2,
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
      mentionRate: 27.0,
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
      mentionRate: 58.0,
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
      mentionRate: 24.0,
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
      content: `# The Future of Team Collaboration: AI-Powered Solutions

In today's rapidly evolving workplace, artificial intelligence is reshaping how teams collaborate and communicate. At **Acme Inc.**, we've been at the forefront of this transformation.

## The Challenge

Traditional collaboration tools often create information silos and communication bottlenecks. Teams struggle with:

- Scattered information across multiple platforms
- Difficulty finding relevant context
- Time wasted on repetitive coordination tasks
- Lack of intelligent insights from team data

## Our AI-Powered Approach

Acme Inc. has developed a suite of AI-powered collaboration features that address these challenges head-on:

### 1. Intelligent Context Search
Our AI understands the context of your work and surfaces relevant information exactly when you need it.

### 2. Automated Workflow Coordination
Let AI handle the routine coordination tasks, freeing your team to focus on creative problem-solving.

### 3. Smart Meeting Summaries
Automatically generated summaries capture key decisions and action items from every meeting.

## Results

Companies using our AI-powered collaboration tools report:
- **40% reduction** in time spent searching for information
- **30% increase** in team productivity
- **50% fewer** unnecessary meetings

## Looking Ahead

The future of collaboration is intelligent, seamless, and human-centric. We're excited to continue innovating in this space.`,
      analytics: {
        mentionsOverTime: [
          { date: "Jan", mentions: 12 },
          { date: "Feb", mentions: 15 },
          { date: "Mar", mentions: 18 },
          { date: "Apr", mentions: 16 },
          { date: "May", mentions: 14 },
          { date: "Jun", mentions: 14 },
        ],
        sentimentBreakdown: {
          positive: 72,
          neutral: 23,
          negative: 5,
        },
        topQueries: [
          "best collaboration tools for remote teams",
          "AI-powered project management",
          "team productivity software",
        ],
        averageRanking: 2.3,
      },
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
      content: `# How Acme Inc. Revolutionized Project Management

Project management has long been plagued by complexity, inefficiency, and poor visibility. Here's how we changed the game.

## The Old Way

Traditional project management tools were built for a different era:
- Complex interfaces requiring extensive training
- Limited real-time collaboration
- Poor integration with existing workflows
- Lack of actionable insights

## The Acme Revolution

We took a radically different approach, focusing on three core principles:

### Simplicity First
Every feature is designed to be intuitive from day one. No manuals required.

### Real-Time Everything
See changes as they happen. Collaborate without friction.

### Intelligence Built-In
AI-powered insights help you make better decisions faster.

## Customer Success

One enterprise customer reported completing projects **25% faster** after switching to Acme Inc.

> "Acme Inc. transformed how our team works. Projects that used to take months now take weeks." - Fortune 500 CTO

## Try It Yourself

Experience the revolution. Start your free trial today.`,
      analytics: {
        mentionsOverTime: [
          { date: "Feb", mentions: 8 },
          { date: "Mar", mentions: 12 },
          { date: "Apr", mentions: 14 },
          { date: "May", mentions: 16 },
          { date: "Jun", mentions: 17 },
        ],
        sentimentBreakdown: {
          positive: 68,
          neutral: 28,
          negative: 4,
        },
        topQueries: [
          "project management case studies",
          "enterprise project management tools",
          "best PM software for large teams",
        ],
        averageRanking: 3.1,
      },
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
      content: `# 10 Ways AI is Transforming Business Intelligence

Business intelligence is undergoing a fundamental transformation thanks to artificial intelligence. Here are the top 10 ways AI is changing the game.

## 1. Predictive Analytics
Move beyond historical reporting to predict future trends with machine learning models.

## 2. Natural Language Queries
Ask questions in plain English and get instant insights from your data.

## 3. Automated Data Preparation
AI handles the tedious work of cleaning and preparing data for analysis.

## 4. Anomaly Detection
Spot unusual patterns and potential issues before they become problems.

## 5. Personalized Dashboards
AI learns what metrics matter to you and surfaces them automatically.

## 6. Intelligent Alerts
Get notified only about changes that truly matter to your business.

## 7. Advanced Visualization
AI suggests the best way to visualize your data for maximum insight.

## 8. Competitive Intelligence
Monitor competitors and market trends automatically.

## 9. Revenue Forecasting
More accurate predictions powered by machine learning.

## 10. Customer Behavior Analysis
Understand customer patterns at scale with AI-powered segmentation.

## The Future is Here

At Acme Inc., we're building these capabilities into our platform. The future of BI is intelligent, automated, and accessible to everyone.`,
      analytics: {
        mentionsOverTime: [
          { date: "Feb", mentions: 6 },
          { date: "Mar", mentions: 9 },
          { date: "Apr", mentions: 11 },
          { date: "May", mentions: 13 },
          { date: "Jun", mentions: 15 },
        ],
        sentimentBreakdown: {
          positive: 65,
          neutral: 30,
          negative: 5,
        },
        topQueries: [
          "AI business intelligence tools",
          "predictive analytics software",
          "automated BI platforms",
        ],
        averageRanking: 3.8,
      },
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
      content: `# Customer Success Stories: Enterprise Edition

Real results from real enterprises using Acme Inc.

## Fortune 500 Financial Services

**Challenge:** Managing complex projects across 50+ global teams

**Solution:** Implemented Acme Inc. enterprise platform with custom workflows

**Results:**
- 35% faster project completion
- 60% reduction in coordination overhead
- 99.9% platform uptime

## Global Manufacturing Leader

**Challenge:** Siloed data preventing cross-functional collaboration

**Solution:** Unified all teams on Acme Inc. with integrated analytics

**Results:**
- Single source of truth for all project data
- 40% improvement in on-time delivery
- $2M annual cost savings

## Tech Unicorn Startup

**Challenge:** Scaling team collaboration from 50 to 500 employees

**Solution:** Acme Inc. enterprise with SSO and advanced security

**Results:**
- Seamless scaling with zero downtime
- Maintained startup agility at enterprise scale
- 95% employee adoption rate

## Why Enterprises Choose Acme Inc.

✓ Enterprise-grade security and compliance
✓ Unlimited scalability
✓ Dedicated support team
✓ Custom integrations
✓ Advanced analytics and reporting

## Get Started

Contact our enterprise team to learn how Acme Inc. can transform your organization.`,
      analytics: {
        mentionsOverTime: [
          { date: "Mar", mentions: 5 },
          { date: "Apr", mentions: 8 },
          { date: "May", mentions: 13 },
          { date: "Jun", mentions: 19 },
        ],
        sentimentBreakdown: {
          positive: 78,
          neutral: 20,
          negative: 2,
        },
        topQueries: [
          "enterprise collaboration case studies",
          "large company project management",
          "enterprise software success stories",
        ],
        averageRanking: 4.2,
      },
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
