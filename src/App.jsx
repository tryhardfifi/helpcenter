import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataSourceProvider } from './contexts/DataSourceContext';
import { CompanyDataProvider } from './contexts/CompanyDataContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Competitors from './pages/Competitors';
import Prompts from './pages/Prompts';
import PromptDetailPage from './pages/PromptDetailPage';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <AuthProvider>
      <DataSourceProvider>
        <CompanyDataProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/login" element={<Login />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/competitors" element={<Competitors />} />
                <Route path="/prompts" element={<Prompts />} />
                <Route path="/prompts/:id" element={<PromptDetailPage />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CompanyDataProvider>
      </DataSourceProvider>
    </AuthProvider>
  );
}

export default App;
