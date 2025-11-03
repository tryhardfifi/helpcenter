import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { getDataSource } from '@/services/dataService';
import PromptDetail from '@/components/prompts/PromptDetail';

const PromptDetailPage = () => {
  const { id } = useParams();
  const { prompts, loading } = useCompanyData();

  // Find the prompt from cached data
  const prompt = prompts.find(p => p.id === id);

  if (loading) {
    return (
      <div className="space-y-6">
        <Link to="/prompts">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Prompts
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!prompt) {
    const isFirestoreMode = !getDataSource();

    return (
      <div className="space-y-6">
        <Link to="/prompts">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Prompts
          </Button>
        </Link>

        {isFirestoreMode ? (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Database className="h-5 w-5" />
                Firestore Data Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-900">
              <p className="mb-3">
                You're using Firestore mode, but no data has been seeded yet.
              </p>
              <div className="bg-white/50 p-3 rounded border border-orange-200">
                <p className="font-semibold mb-2">To seed demo data, run:</p>
                <code className="block bg-orange-100 px-3 py-2 rounded text-sm font-mono">
                  npm run seed
                </code>
                <p className="text-sm mt-2 text-muted-foreground">
                  Or with a custom email: <code className="bg-orange-100 px-1 rounded">npm run seed your@email.com</code>
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold">Prompt not found</h2>
            <p className="text-muted-foreground mt-2">
              The prompt you're looking for doesn't exist.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/prompts">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Prompts
        </Button>
      </Link>

      <PromptDetail prompt={prompt} />
    </div>
  );
};

export default PromptDetailPage;
