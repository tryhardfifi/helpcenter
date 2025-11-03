import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const MetricCard = ({ title, value, change, trend, suffix = '', onClick, isActive = false }) => {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-black' : trend === 'down' ? 'text-gray-500' : 'text-gray-400';

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md bg-gray-50",
        isActive && "ring-2 ring-black shadow-lg bg-white"
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div className="text-3xl font-bold">
            {value}{suffix}
          </div>
          {change !== undefined && (
            <div className={cn("flex items-center gap-1 text-sm font-medium", trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
