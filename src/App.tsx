import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppInitializer } from './components/AppInitializer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Prompts from './pages/Prompts';
import PromptDetailPage from './pages/PromptDetailPage';
import Settings from './pages/Settings';
import Sources from './pages/Sources';
import Competitors from './pages/Competitors';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <BrowserRouter>
      <AppInitializer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/prompts" element={<Prompts />} />
            <Route path="/prompts/:id" element={<PromptDetailPage />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </AppInitializer>
    </BrowserRouter>
  );
}

export default App;
