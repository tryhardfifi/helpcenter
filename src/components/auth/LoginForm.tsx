import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const login = useAuthStore((state) => state.login);
  const signup = useAuthStore((state) => state.signup);
  const checkOnboardingStatus = useAuthStore((state) => state.checkOnboardingStatus);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isSignUp
      ? await signup(email, password)
      : await login(email, password);

    if (result.success) {
      // Check if user needs onboarding
      if (result.isNewUser) {
        // New signup - always go to onboarding
        navigate('/onboarding');
      } else {
        // Existing user - check if they completed onboarding
        const onboardingStatus = await checkOnboardingStatus(email);
        if (onboardingStatus.needsOnboarding) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">AI SEO</CardTitle>
        <CardDescription>
          {isSignUp ? 'Create an account to get started' : 'Sign in to your account to continue'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            {isSignUp && (
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            )}
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? (isSignUp ? 'Creating account...' : 'Signing in...')
              : (isSignUp ? 'Sign Up' : 'Sign In')
            }
          </Button>
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"
              }
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
