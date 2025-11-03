import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { DataSourceProvider } from './contexts/DataSourceContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Competitors from './pages/Competitors';
import Prompts from './pages/Prompts';
import PromptDetailPage from './pages/PromptDetailPage';
import AppLayout from './components/layout/AppLayout';

function App() {
  return (
    <AuthProvider>
      <DataSourceProvider>
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
            </Route>
          </Routes>
        </BrowserRouter>
      </DataSourceProvider>
    </AuthProvider>
  );
}

export default App;
