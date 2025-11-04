import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { completeOnboarding } from '@/services/onboardingService';
import { Loader2, CheckCircle2, Sparkles, Building2, Search } from 'lucide-react';

const Onboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('input'); // input, processing, success
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const validateUrl = (url) => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      return 'Please enter a company website URL';
    }

    // Basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;
    const withoutProtocol = trimmedUrl.replace(/^https?:\/\//, '');

    if (!urlPattern.test(withoutProtocol) && !urlPattern.test(trimmedUrl)) {
      return 'Please enter a valid website URL (e.g., company.com or https://www.company.com)';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate URL
    const validationError = validateUrl(url);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');
    setProgress(0);

    try {
      // Step 1: Fetching company info
      setStatusMessage('Analyzing your website...');
      setProgress(25);

      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 500));

      setStatusMessage('Extracting company information...');
      setProgress(50);

      // Execute onboarding
      const onboardingResult = await completeOnboarding(url, user.email);

      setStatusMessage('Generating discovery prompts...');
      setProgress(75);

      await new Promise(resolve => setTimeout(resolve, 500));

      setStatusMessage('Finalizing setup...');
      setProgress(100);

      // Success!
      setResult(onboardingResult);
      setStep('success');

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Onboarding error:', err);
      setError(err.message || 'An error occurred during onboarding. Please try again.');
      setStep('input');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow users to skip onboarding and go to dashboard
    navigate('/dashboard');
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Welcome to AI SEO!</CardTitle>
          </div>
          <CardDescription>
            Let's set up your account by analyzing your company website
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Input Step */}
          {step === 'input' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="url" className="text-base font-medium">
                  Company Website URL
                </Label>
                <Input
                  id="url"
                  type="text"
                  placeholder="e.g., yourcompany.com or https://www.yourcompany.com"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError(''); // Clear error on input change
                  }}
                  required
                  className="text-base"
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">
                  We'll use AI to extract your company information and generate relevant search prompts
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Continue
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={loading}
                  className="w-full"
                >
                  Skip for now
                </Button>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground">What happens next:</p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      1
                    </div>
                    <div>
                      <p className="text-sm font-medium">Company Analysis</p>
                      <p className="text-xs text-muted-foreground">
                        AI extracts your company name, industry, products, and target audience
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      2
                    </div>
                    <div>
                      <p className="text-sm font-medium">Prompt Generation</p>
                      <p className="text-xs text-muted-foreground">
                        Generate 10 discovery prompts that potential customers might search for
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                      3
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dashboard Ready</p>
                      <p className="text-xs text-muted-foreground">
                        Start tracking your visibility in AI answer engines
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Processing Step */}
          {step === 'processing' && (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <Loader2 className="h-16 w-16 animate-spin text-primary" />
                    <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Setting up your account</h3>
                  <p className="text-sm text-muted-foreground">{statusMessage}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  {progress}% complete
                </p>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                This may take 30-60 seconds...
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && result && (
            <div className="space-y-6 py-8">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-green-600">
                    Setup Complete!
                  </h3>
                  <p className="text-muted-foreground">
                    Your account has been successfully configured
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Company Name</span>
                  <span className="text-sm text-muted-foreground">{result.companyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Discovery Prompts
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {result.promptCount} prompts created
                  </span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Redirecting to your dashboard...
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
