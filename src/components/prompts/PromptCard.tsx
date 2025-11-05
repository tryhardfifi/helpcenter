import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const PromptCard = ({ prompt }) => {
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
    <Link to={`/prompts/${prompt.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium line-clamp-2">
              {prompt.text}
            </CardTitle>
            <Badge variant={getTrendVariant(prompt.trend)} className="gap-1 shrink-0">
              {getTrendIcon(prompt.trend)}
              {prompt.trend}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Mention Rate:</span>
              <span className="font-semibold ml-2">{prompt.mentionRate}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg Position:</span>
              <span className="font-semibold ml-2">#{prompt.analytics.averagePosition}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PromptCard;
