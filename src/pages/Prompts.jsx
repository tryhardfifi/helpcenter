import { Link } from 'react-router-dom';
import { mockCompanyData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const Prompts = () => {
  const prompts = mockCompanyData.prompts;

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
      <div>
        <h1 className="text-3xl font-bold">Prompts</h1>
        <p className="text-muted-foreground mt-1">
          Track AI mentions across different prompts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tracked Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prompt</TableHead>
                <TableHead className="text-right">Mention Rate</TableHead>
                <TableHead className="text-right">Avg Position</TableHead>
                <TableHead className="text-center">Sentiment</TableHead>
                <TableHead className="text-center">Trend</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow
                  key={prompt.id}
                  className="cursor-pointer hover:bg-secondary/50"
                  onClick={() => window.location.href = `/prompts/${prompt.id}`}
                >
                  <TableCell className="font-medium max-w-md">
                    <Link
                      to={`/prompts/${prompt.id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {prompt.text}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{prompt.mentionRate}%</TableCell>
                  <TableCell className="text-right">#{prompt.analytics.averagePosition}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="capitalize">
                      {prompt.analytics.sentiment}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={getTrendVariant(prompt.trend)} className="gap-1">
                      {getTrendIcon(prompt.trend)}
                      {prompt.trend}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {new Date(prompt.lastUpdated).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prompts;
