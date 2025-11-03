import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockCompanyData } from '@/data/mockData';
import PromptDetail from '@/components/prompts/PromptDetail';

const PromptDetailPage = () => {
  const { id } = useParams();
  const prompt = mockCompanyData.prompts.find(p => p.id === id);

  if (!prompt) {
    return (
      <div className="space-y-6">
        <Link to="/prompts">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Prompts
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Prompt not found</h2>
          <p className="text-muted-foreground mt-2">
            The prompt you're looking for doesn't exist.
          </p>
        </div>
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
