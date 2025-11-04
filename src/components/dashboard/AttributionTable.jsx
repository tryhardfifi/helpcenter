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
import { TrendingUp, TrendingDown, Minus, ExternalLink, ArrowRight } from 'lucide-react';

const AttributionTable = ({ data = [], title = "Top Pages", company, analytics }) => {
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
                <TableHead className="w-auto">Source URL</TableHead>
                <TableHead className="text-right w-32">Mention Rate</TableHead>
                <TableHead className="text-right w-32">Share of Total</TableHead>
                <TableHead className="text-center w-28">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((page, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <a
                      href={page.url.startsWith('http') ? page.url : `https://${page.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-primary transition-colors"
                    >
                      {page.url}
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    </a>
                  </TableCell>
                  <TableCell className="text-right font-semibold w-32">{page.mentionRate}%</TableCell>
                  <TableCell className="text-right font-semibold w-32">{page.percentage}%</TableCell>
                  <TableCell className="text-center w-28">
                    <Badge variant={getTrendVariant(page.trend)} className="gap-1">
                      {getTrendIcon(page.trend)}
                      {page.trend}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-secondary/50">
                <TableCell colSpan={4} className="text-center">
                  <Link
                    to="/sources"
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

export default AttributionTable;
