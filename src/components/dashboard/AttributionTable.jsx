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

const AttributionTable = ({ data = [], title = "Top Pages", company }) => {
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

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">No data available</p>
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
            {competitors.map((competitor) => (
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
