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
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TopPromptsTable = ({ data, title = "Top Prompts", company }) => {
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

  // Create competitor list with own company first
  const competitors = [
    { id: 'own', name: company?.name || 'Your Business', dataKey: 'acme' },
    ...(company?.competitors || []).map(comp => ({
      id: comp.id,
      name: comp.name,
      dataKey: comp.name.replace(/\s+/g, '').charAt(0).toLowerCase() + comp.name.replace(/\s+/g, '').slice(1)
    }))
  ];

  // Get the data key for the selected competitor
  const selectedDataKey = competitors.find(c => c.id === selectedCompetitor)?.dataKey || 'acme';

  // Get mention rate for selected competitor from the latest data point
  const getCompetitorMentionRate = (prompt) => {
    if (!prompt.analytics?.mentionsOverTime) return 0;
    const latestData = prompt.analytics.mentionsOverTime[prompt.analytics.mentionsOverTime.length - 1];
    return latestData?.[selectedDataKey] || 0;
  };

  // Sort prompts by the selected competitor's mention rate
  const sortedData = [...data].sort((a, b) =>
    getCompetitorMentionRate(b) - getCompetitorMentionRate(a)
  );

  return (
    <Card>
      <CardHeader>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/prompts">Show all</Link>
            </Button>
          </div>
          <Tabs value={selectedCompetitor} onValueChange={setSelectedCompetitor}>
            <TabsList>
              {competitors.map((competitor) => (
                <TabsTrigger key={competitor.id} value={competitor.id}>
                  {competitor.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
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
                <TableRow key={prompt.id || index}>
                  <TableCell className="font-medium max-w-md">{prompt.text}</TableCell>
                  <TableCell className="text-right font-semibold w-32">{mentionRate}%</TableCell>
                  <TableCell className="text-right font-semibold w-32">#{rank}</TableCell>
                  <TableCell className="text-center w-28">
                    <Badge variant={getTrendVariant(prompt.trend)} className="gap-1">
                      {getTrendIcon(prompt.trend)}
                      {prompt.trend}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopPromptsTable;
