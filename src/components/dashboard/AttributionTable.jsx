import { useState } from 'react';
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
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const AttributionTable = ({ data, title = "Top Pages", company }) => {
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

  return (
    <Card>
      <CardHeader>
        <div className="space-y-6">
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source URL</TableHead>
              <TableHead className="text-right">Mention Rate</TableHead>
              <TableHead className="text-right">Share of Total</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((page, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{page.url}</TableCell>
                <TableCell className="text-right">{page.mentionRate}%</TableCell>
                <TableCell className="text-right">{page.percentage}%</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getTrendVariant(page.trend)} className="gap-1">
                    {getTrendIcon(page.trend)}
                    {page.trend}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AttributionTable;
