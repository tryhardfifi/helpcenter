import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MentionChart from '@/components/dashboard/MentionChart';
import RankingChart from '@/components/dashboard/RankingChart';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const PromptDetail = ({ prompt }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendVariant = (trend) => {
    switch (trend) {
      case 'up':
        return 'default';
      case 'down':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Prompt Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{prompt.text}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Created: {new Date(prompt.createdAt).toLocaleDateString()}</span>
                <span>Last Updated: {new Date(prompt.lastUpdated).toLocaleDateString()}</span>
              </div>
            </div>
            <Badge variant={getTrendVariant(prompt.trend)} className="gap-1">
              {getTrendIcon(prompt.trend)}
              {prompt.trend}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Mentions</p>
              <p className="text-2xl font-bold">{prompt.totalMentions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Position</p>
              <p className="text-2xl font-bold">#{prompt.analytics.averagePosition}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sentiment</p>
              <p className="text-2xl font-bold capitalize">{prompt.analytics.sentiment}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Co-mentions</p>
              <p className="text-2xl font-bold">{prompt.analytics.coMentions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <MentionChart data={prompt.analytics.mentionsOverTime} title="Mentions Over Time" />
        <RankingChart data={prompt.analytics.rankingsOverTime} title="Rankings Over Time" />
      </div>

      {/* Co-mentions */}
      {prompt.analytics.coMentions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Frequently Co-mentioned With</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {prompt.analytics.coMentions.map((company, index) => (
                <Badge key={index} variant="secondary">
                  {company}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PromptDetail;
