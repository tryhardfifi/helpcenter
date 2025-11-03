import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const MetricCard = ({ title, value, change, trend, suffix = '', onClick, isActive = false, info }) => {
  const [showTooltip, setShowTooltip] = useState(false);
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
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {title}
          {info && (
            <div className="relative inline-block">
              <Info
                className="h-4 w-4 cursor-help text-gray-400 hover:text-gray-600 transition-colors"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(!showTooltip);
                }}
              />
              {showTooltip && (
                <div className="absolute z-50 w-64 p-3 text-xs font-normal text-gray-700 bg-white border border-gray-200 rounded-lg shadow-lg left-0 top-6">
                  {info}
                </div>
              )}
            </div>
          )}
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
