import { Link } from 'react-router-dom';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { getDataSource } from '@/services/dataService';
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
import { TrendingUp, TrendingDown, Minus, Database } from 'lucide-react';

const Prompts = () => {
  const { prompts, loading } = useCompanyData();

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    const isFirestoreMode = !getDataSource();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground mt-1">
            Track AI mentions across different prompts
          </p>
        </div>

        {isFirestoreMode && (
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
        )}

        {!isFirestoreMode && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No prompts available</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

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
