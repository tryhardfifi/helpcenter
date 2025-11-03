import { useState, useMemo } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
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
import { TrendingUp, TrendingDown, Minus, ExternalLink } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const Sources = () => {
  const { company, loading } = useCompanyData();
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Filter sources based on type
  const filteredSources = useMemo(() => {
    if (!company?.analytics?.topSources) return [];

    const sources = company.analytics.topSources;

    if (selectedFilter === 'all') return sources;

    if (selectedFilter === 'owned') {
      return sources.filter(source => source.type === 'own');
    }

    if (selectedFilter === 'social') {
      return sources.filter(source => source.type === 'reddit');
    }

    if (selectedFilter === 'publications') {
      return sources.filter(source => source.type === 'news' || source.type === 'external');
    }

    return sources;
  }, [company, selectedFilter]);

  // Process data for domain chart - group by domain
  const domainChartData = useMemo(() => {
    if (!company?.analytics?.topSources) return [];

    const domainMap = new Map();

    company.analytics.topSources.forEach(source => {
      // Extract domain from URL
      const domain = source.url.split('/')[0];

      if (domainMap.has(domain)) {
        domainMap.set(domain, domainMap.get(domain) + source.mentionRate);
      } else {
        domainMap.set(domain, source.mentionRate);
      }
    });

    // Convert to array and sort by mention rate
    return Array.from(domainMap, ([domain, mentions]) => ({
      domain,
      mentions: parseFloat(mentions.toFixed(1))
    }))
    .sort((a, b) => b.mentions - a.mentions)
    .slice(0, 8); // Top 8 domains
  }, [company]);

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

  const getTypeLabel = (type) => {
    switch (type) {
      case 'own':
        return 'Owned';
      case 'reddit':
        return 'Social';
      case 'news':
        return 'News';
      case 'external':
        return 'External';
      default:
        return type;
    }
  };

  const getTypeVariant = (type) => {
    switch (type) {
      case 'own':
        return 'default';
      case 'reddit':
        return 'secondary';
      case 'news':
        return 'outline';
      case 'external':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getBarColor = (domain) => {
    if (domain.includes('acme.com')) return '#000000';
    if (domain.includes('reddit')) return '#FF4500';
    if (domain.includes('techcrunch')) return '#0A66C2';
    if (domain.includes('ycombinator')) return '#FF6600';
    if (domain.includes('medium')) return '#00AB6C';
    if (domain.includes('producthunt')) return '#DA552F';
    return '#666666';
  };

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'owned', label: 'Owned' },
    { id: 'social', label: 'Social' },
    { id: 'publications', label: 'Publications' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Sources</h1>
        <p className="text-muted-foreground mt-1">
          Track which sources cite your content and drive mentions
        </p>
      </div>

      {/* Domain Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top Citing Domains</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={domainChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="domain"
                stroke="#000"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={120}
              />
              <YAxis
                stroke="#000"
                style={{ fontSize: '12px' }}
                label={{ value: 'Mention Rate (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px'
                }}
                formatter={(value) => [`${value}%`, 'Mention Rate']}
              />
              <Bar dataKey="mentions" radius={[8, 8, 0, 0]}>
                {domainChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.domain)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Sources Table with Filters */}
      <Card>
        <CardHeader>
          <div className="space-y-4">
            <CardTitle>All Sources</CardTitle>

            {/* Filter Tabs */}
            <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
              <TabsList>
                {filters.map((filter) => (
                  <TabsTrigger key={filter.id} value={filter.id}>
                    {filter.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSources.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No sources found for this filter
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-auto">Source URL</TableHead>
                  <TableHead className="text-center w-24">Type</TableHead>
                  <TableHead className="text-right w-32">Mention Rate</TableHead>
                  <TableHead className="text-right w-32">Share of Total</TableHead>
                  <TableHead className="text-center w-28">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <a
                        href={source.url.startsWith('http') ? source.url : `https://${source.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        {source.url}
                        <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell className="text-center w-24">
                      <Badge variant={getTypeVariant(source.type)} className="text-xs">
                        {getTypeLabel(source.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold w-32">
                      {source.mentionRate}%
                    </TableCell>
                    <TableCell className="text-right font-semibold w-32">
                      {source.percentage}%
                    </TableCell>
                    <TableCell className="text-center w-28">
                      <Badge variant={getTrendVariant(source.trend)} className="gap-1">
                        {getTrendIcon(source.trend)}
                        {source.trend}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Sources;
