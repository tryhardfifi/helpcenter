# AI SEO - Frontend Implementation Plan

## Project Overview
A minimalist monochrome black SaaS frontend for tracking AI mentions. Built with **Vite + React + shadcn/ui** with Firebase authentication and mock data for all analytics.

**Product Name**: AI SEO
**Pricing**: $100/month (with free tier)
**Mock Company**: Acme Inc.

---

## Tech Stack
- **Framework**: Vite + React
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: Firebase Authentication
- **Charts**: Recharts (works well with shadcn)
- **Routing**: React Router DOM
- **Icons**: Lucide React (comes with shadcn)

---

## 1. Project Setup

### Initialize Project
```bash
npm create vite@latest ai-seo -- --template react
cd ai-seo
npm install
```

### Install Dependencies
```bash
# shadcn/ui and Tailwind
npx shadcn@latest init

# Additional packages
npm install firebase
npm install react-router-dom
npm install recharts
npm install lucide-react
```

### Install shadcn Components (as needed)
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add table
npx shadcn@latest add tabs
npx shadcn@latest add avatar
npx shadcn@latest add badge
npx shadcn@latest add select
npx shadcn@latest add separator
npx shadcn@latest add scroll-area
```

---

## 2. Firebase Configuration

### Create `/src/lib/firebase.js`
```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC7qt2GvvP65Z7L5xXKoWHvZfFJ9AXQ29Y",
  authDomain: "help-66e2c.firebaseapp.com",
  projectId: "help-66e2c",
  storageBucket: "help-66e2c.firebasestorage.app",
  messagingSenderId: "992898284975",
  appId: "1:992898284975:web:954250ee78e0b218f4c35a",
  measurementId: "G-HTTLDR7J1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export default app;
```

---

## 3. Project Structure

```
ai-seo/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── AppLayout.jsx
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   ├── dashboard/
│   │   │   ├── MetricCard.jsx
│   │   │   ├── MentionChart.jsx
│   │   │   ├── RankingChart.jsx
│   │   │   ├── AttributionTable.jsx
│   │   ├── prompts/
│   │   │   ├── PromptList.jsx
│   │   │   ├── PromptCard.jsx
│   │   │   ├── PromptDetail.jsx
│   │   ├── articles/
│   │   │   ├── ArticleList.jsx
│   │   │   ├── ArticleCard.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Prompts.jsx
│   │   ├── PromptDetailPage.jsx
│   │   ├── Articles.jsx
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   ├── data/
│   │   ├── mockData.js
│   ├── lib/
│   │   ├── firebase.js
│   │   ├── utils.js              # shadcn utils
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

---

## 4. Styling Configuration

### Update `tailwind.config.js` for Monochrome Theme
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(0, 0%, 89%)",
        input: "hsl(0, 0%, 89%)",
        ring: "hsl(0, 0%, 0%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(0, 0%, 0%)",
        primary: {
          DEFAULT: "hsl(0, 0%, 0%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(0, 0%, 96%)",
          foreground: "hsl(0, 0%, 0%)",
        },
        muted: {
          DEFAULT: "hsl(0, 0%, 96%)",
          foreground: "hsl(0, 0%, 45%)",
        },
        accent: {
          DEFAULT: "hsl(0, 0%, 96%)",
          foreground: "hsl(0, 0%, 0%)",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 5. Mock Data Structure

### Firestore-Ready Data Architecture
Data is structured to mirror future Firestore collections:
- `companies/{companyId}` - Company document
- `companies/{companyId}/prompts` - Prompts subcollection
- `companies/{companyId}/articles` - Articles subcollection

### Create `/src/data/mockData.js`
```javascript
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
```

---

## 6. Implementation Steps

### Step 1: Authentication Setup
**Files to create:**
- `/src/contexts/AuthContext.jsx` - Auth state management
- `/src/components/auth/LoginForm.jsx` - Login UI
- `/src/components/auth/ProtectedRoute.jsx` - Route protection
- `/src/pages/Login.jsx` - Login page

**Key functionality:**
- Email/password sign in with Firebase
- Auth state persistence
- Protected route wrapper
- Logout functionality

---

### Step 2: Layout Components
**Files to create:**
- `/src/components/layout/Sidebar.jsx`
- `/src/components/layout/AppLayout.jsx`

**Sidebar features:**
- Company name header ("Acme Inc.")
- Three navigation items: Dashboard, Prompts, Articles
- User profile section at bottom
- Logout button

---

### Step 3: Dashboard Page
**Files to create:**
- `/src/pages/Dashboard.jsx`
- `/src/components/dashboard/MetricCard.jsx`
- `/src/components/dashboard/MentionChart.jsx`
- `/src/components/dashboard/RankingChart.jsx`
- `/src/components/dashboard/AttributionTable.jsx`

**Features:**
- 4 metric cards at top (total mentions, growth, ranking, top page)
- Mention % over time chart (line chart with 4 companies)
- Rankings over time chart (line chart, inverted Y-axis)
- Top pages attribution table
- Use Recharts with monochrome styling

---

### Step 4: Prompts Page
**Files to create:**
- `/src/pages/Prompts.jsx`
- `/src/pages/PromptDetailPage.jsx`
- `/src/components/prompts/PromptList.jsx`
- `/src/components/prompts/PromptCard.jsx`
- `/src/components/prompts/PromptDetail.jsx`

**Features:**
- Grid/list of prompt cards
- Click to navigate to detail page
- Detail page shows same charts as dashboard but filtered for that prompt
- Trend indicators (up/down/stable)

---

### Step 5: Articles Page
**Files to create:**
- `/src/pages/Articles.jsx`
- `/src/components/articles/ArticleList.jsx`
- `/src/components/articles/ArticleCard.jsx`

**Features:**
- Table or card grid of articles
- Show title, URL, date, mentions, impact
- Simple clean layout

---

### Step 6: Routing Setup
**Update `/src/App.jsx`:**
```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import PromptDetailPage from './pages/PromptDetailPage';
import Articles from './pages/Articles';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/prompts/:id" element={<PromptDetailPage />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## 7. Design Guidelines

### Monochrome Styling
- **Background**: White (`#FFFFFF`)
- **Text**: Black (`#000000`)
- **Borders**: Light gray (`#E5E5E5`)
- **Cards**: White with subtle border
- **Hover states**: Light gray background (`#F5F5F5`)
- **Charts**: Black lines with gray variations

### Component Patterns
- Consistent padding: `p-4`, `p-6`, `p-8`
- Card borders: `border border-gray-200`
- Rounded corners: `rounded-lg`
- Shadows: Minimal or none, prefer borders
- Typography: Use default shadcn font stack

---

## 8. Key Features Checklist

### Authentication ✓
- [x] Firebase auth setup
- [x] Login form
- [x] Protected routes
- [x] Auth context
- [x] Logout functionality

### Dashboard ✓
- [x] Metric cards
- [x] Mention percentage chart
- [x] Rankings chart
- [x] Attribution table
- [x] Mock data integration

### Prompts ✓
- [x] Prompt list view
- [x] Prompt cards
- [x] Click to detail
- [x] Detail page with charts
- [x] Mock prompts data

### Articles ✓
- [x] Article list
- [x] Article cards/table
- [x] Mock articles data

### Layout ✓
- [x] Sidebar with navigation
- [x] Company header in sidebar
- [x] Responsive layout
- [x] Route integration

---

## 9. Quick Start Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 10. Environment Variables

Create `.env.local` (optional, since we're hardcoding Firebase config):
```
VITE_FIREBASE_API_KEY=AIzaSyC7qt2GvvP65Z7L5xXKoWHvZfFJ9AXQ29Y
VITE_FIREBASE_AUTH_DOMAIN=help-66e2c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=help-66e2c
```

---

## Notes
- **No backend needed** - Everything uses mock data
- **Firebase only for auth** - Real authentication, fake analytics data
- **Focus on UI/UX** - Make it look professional and minimal
- **Recharts for graphs** - Easy to style in monochrome
- **shadcn/ui components** - Pre-styled, customizable

---

## Next Steps After Implementation
1. Test authentication flow
2. Verify all routes work
3. Check responsive design
4. Ensure charts render correctly
5. Polish animations and transitions
6. Add loading states
7. Deploy to Vercel/Netlify