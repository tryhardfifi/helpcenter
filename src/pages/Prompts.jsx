import { mockCompanyData } from '@/data/mockData';
import PromptList from '@/components/prompts/PromptList';

const Prompts = () => {
  const prompts = mockCompanyData.prompts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Prompts</h1>
        <p className="text-muted-foreground mt-1">
          Track AI mentions across different prompts
        </p>
      </div>

      <PromptList prompts={prompts} />
    </div>
  );
};

export default Prompts;
