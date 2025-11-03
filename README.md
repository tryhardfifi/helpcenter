# AI SEO - AI Mentions Tracking SaaS

A minimalist monochrome black SaaS frontend for tracking AI mentions. Built with Vite + React + shadcn/ui with Firebase authentication and mock data for all analytics.

## Features

- **Authentication**: Firebase email/password authentication
- **Dashboard**: Overview of AI mentions with metrics, charts, and attribution data
- **Prompts Tracking**: Monitor AI mentions across different prompts
- **Articles Management**: Track your published content and its AI mention impact
- **Monochrome Design**: Clean, professional black and white interface

## Tech Stack

- **Framework**: Vite + React
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: Firebase Authentication
- **Charts**: Recharts
- **Routing**: React Router DOM
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Firebase account (already configured)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd aiseo
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Firebase Authentication Setup

The app uses Firebase Authentication. To test the app:

1. Create a test account by signing up at the login page
2. Or use an existing Firebase account associated with the configured project

## Project Structure

```
ai-seo/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn components
│   │   ├── layout/                # Sidebar, AppLayout
│   │   ├── auth/                  # Login, ProtectedRoute
│   │   ├── dashboard/             # Dashboard components
│   │   ├── prompts/               # Prompts components
│   │   └── articles/              # Articles components
│   ├── pages/                     # Page components
│   ├── contexts/                  # React contexts (Auth)
│   ├── data/                      # Mock data
│   ├── lib/                       # Utilities and Firebase config
│   ├── App.jsx                    # Main app with routing
│   └── main.jsx                   # Entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Mock Data

All analytics data is mocked and simulates:
- Company: Acme Inc. (B2B SaaS)
- Competitors: CompetitorCo, RivalTech, IndustryCorp
- 5 tracked prompts with analytics
- 4 published articles with mention data

## Design Guidelines

The app follows a strict monochrome theme:
- Background: White (#FFFFFF)
- Text: Black (#000000)
- Borders: Light gray (#E5E5E5)
- Minimal shadows, preference for borders
- Clean typography and consistent spacing

## Features Implemented

- ✅ Firebase Authentication
- ✅ Protected Routes
- ✅ Dashboard with metrics and charts
- ✅ Prompts list and detail views
- ✅ Articles management
- ✅ Responsive sidebar navigation
- ✅ Monochrome styling throughout
- ✅ Mock data for all features

## Future Enhancements

- Connect to real backend API
- Add real-time data updates
- Implement search and filtering
- Add export functionality
- User settings and profile management
- Multi-company support

## License

MIT
