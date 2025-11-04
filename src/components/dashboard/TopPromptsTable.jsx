import { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';

const TopPromptsTable = ({ data, title = "Top Prompts", company, analytics }) => {
  const [selectedCompetitor, setSelectedCompetitor] = useState('own');

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

  // Extract competitors from analytics data (those that actually appear in runs)
  const competitorsFromAnalytics = analytics?.visibilityScoreOverTime?.[0]
    ? Object.keys(analytics.visibilityScoreOverTime[0])
        .filter(key => key !== 'date')
        .map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(),
          dataKey: key
        }))
    : [];

  // Create competitor list with own company first
  const companyDataKey = competitorsFromAnalytics[0]?.dataKey || 'acme';
  const competitorsList = [
    { id: 'own', name: company?.name || 'Your Business', dataKey: companyDataKey },
    ...competitorsFromAnalytics.slice(1).map((comp, idx) => ({
      id: `comp-${idx}`,
      name: comp.name,
      dataKey: comp.dataKey
    }))
  ];

  // Get the data key for the selected competitor
  const selectedDataKey = competitorsList.find(c => c.id === selectedCompetitor)?.dataKey || 'acme';

  // Get mention rate for selected competitor from the latest data point
  const getCompetitorMentionRate = (prompt) => {
    if (!prompt.analytics?.mentionsOverTime || prompt.analytics.mentionsOverTime.length === 0) {
      return null; // Return null to indicate no data
    }
    const latestData = prompt.analytics.mentionsOverTime[prompt.analytics.mentionsOverTime.length - 1];
    return latestData?.[selectedDataKey] ?? 0; // Return 0 if key doesn't exist but data does
  };

  // Sort prompts by the selected competitor's mention rate
  const sortedData = [...data].sort((a, b) => {
    const rateA = getCompetitorMentionRate(a);
    const rateB = getCompetitorMentionRate(b);
    // Treat null (no data) as -1 to sort to bottom
    const numA = rateA === null ? -1 : rateA;
    const numB = rateB === null ? -1 : rateB;
    return numB - numA;
  });

  // Check if any prompt has analytics data
  const hasAnyData = data.some(prompt =>
    prompt.analytics?.mentionsOverTime && prompt.analytics.mentionsOverTime.length > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <CardTitle>{title}</CardTitle>
        <Tabs value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
          <TabsList>
            {competitorsList.map((competitor) => (
              <TabsTrigger key={competitor.id} value={competitor.id}>
                {competitor.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <Card className="m-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto">Prompt</TableHead>
                <TableHead className="text-right w-32">Mention Rate</TableHead>
                <TableHead className="text-right w-32">Avg. Rank</TableHead>
                <TableHead className="text-center w-28">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((prompt, index) => {
                const mentionRate = getCompetitorMentionRate(prompt);
                const latestRankings = prompt.analytics?.rankingsOverTime?.[prompt.analytics.rankingsOverTime.length - 1];
                const rank = latestRankings?.[selectedDataKey] || 'N/A';

                return (
                  <TableRow
                    key={prompt.id || index}
                    className="cursor-pointer hover:bg-secondary/50"
                    onClick={() => window.location.href = `/prompts/${prompt.id}`}
                  >
                    <TableCell className="font-medium max-w-md">
                      <Link
                        to={`/prompts/${prompt.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prompt.text}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-semibold w-32">{mentionRate}%</TableCell>
                    <TableCell className="text-right font-semibold w-32">{rank}</TableCell>
                    <TableCell className="text-center w-28">
                      <Badge variant={getTrendVariant(prompt.trend)} className="gap-1">
                        {getTrendIcon(prompt.trend)}
                        {prompt.trend}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="hover:bg-secondary/50">
                <TableCell colSpan={4} className="text-center">
                  <Link
                    to="/prompts"
                    className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
                  >
                    Show all
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopPromptsTable;
