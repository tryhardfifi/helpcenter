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
import { TrendingUp, TrendingDown, Minus, ExternalLink, ArrowRight } from 'lucide-react';

const AttributionTable = ({ data = [], title = "Top Pages", company, analytics }) => {
  const selectedCompetitor = 'own';

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
  const selectedDataKey = competitorsList.find(c => c.id === selectedCompetitor)?.dataKey || companyDataKey;

  // Filter and sort data by selected competitor's mention rate
  const sortedData = data
    .map(source => ({
      ...source,
      mentionRate: source[selectedDataKey] || 0,
      mentionCount: source.competitorMentionCounts?.[selectedDataKey] || 0
    }))
    .sort((a, b) => b.mentionRate - a.mentionRate)
    .slice(0, 5); // Top 5 sources

  // Helper function to get favicon URL from domain
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No analytics data yet</p>
              <p className="text-sm">Run "Run All Prompts" to generate analytics</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <CardTitle>{title}</CardTitle>
      <Card className="m-0">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-auto">Source</TableHead>
                <TableHead className="text-right w-40">Cited</TableHead>
                <TableHead className="text-center w-28">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium p-0">
                    <a
                      href={page.url.startsWith('http') ? page.url : `https://${page.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-4 hover:bg-secondary/50 transition-colors"
                    >
                      {getFaviconUrl(page.url) && (
                        <img
                          src={getFaviconUrl(page.url)}
                          alt=""
                          className="w-8 h-8 rounded flex-shrink-0 mt-0.5"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="flex flex-col gap-1 min-w-0">
                        {page.title && (
                          <div className="font-semibold text-sm truncate">
                            {page.title}
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                          {page.url}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </div>
                      </div>
                    </a>
                  </TableCell>
                  <TableCell className="text-right w-40">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-semibold text-base">{page.mentionRate}%</span>
                      <span className="text-xs text-muted-foreground">
                        {page.mentionCount} out of {page.totalAppearances} times
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center w-28">
                    <Badge variant={getTrendVariant(page.trend)} className="gap-1">
                      {getTrendIcon(page.trend)}
                      {page.trend}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow
                className="cursor-pointer hover:bg-secondary/50"
                onClick={() => window.location.href = '/sources'}
              >
                <TableCell colSpan={3} className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                    Show all
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttributionTable;
