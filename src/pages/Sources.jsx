import { useState, useMemo, useEffect } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { getCompanySources } from '@/services/dataService';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { getDomainColor } from '@/lib/colors';

const Sources = () => {
  const { company, prompts, analytics, loading } = useCompanyData();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sources, setSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);

  // Fetch sources from Firestore
  useEffect(() => {
    const fetchSources = async () => {
      if (!company?.id) return;

      setSourcesLoading(true);
      try {
        const fetchedSources = await getCompanySources(company.id);
        setSources(fetchedSources);
      } catch (error) {
        console.error('Error fetching sources:', error);
      } finally {
        setSourcesLoading(false);
      }
    };

    fetchSources();
  }, [company?.id]);

  // Helper function to get favicon URL from domain
  const getFaviconUrl = (url) => {
    try {
      const domain = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  // Calculate total runs (prompts × 10)
  const totalRuns = useMemo(() => {
    return (prompts?.length || 0) * 10;
  }, [prompts]);

  // Filter sources and calculate cited rate
  const filteredSources = useMemo(() => {
    if (!sources || sources.length === 0) return [];

    let filteredList = sources.map(source => {
      // Calculate cited rate: (citedCount / totalRuns) * 100
      const citedRate = totalRuns > 0
        ? ((source.citedCount / totalRuns) * 100).toFixed(1)
        : 0;

      return {
        ...source,
        citedRate: parseFloat(citedRate),
        citedCount: source.citedCount || 0
      };
    });

    // Filter by type
    if (selectedFilter === 'owned') {
      filteredList = filteredList.filter(source => source.type === 'owned');
    } else if (selectedFilter === 'social') {
      filteredList = filteredList.filter(source => source.type === 'social');
    } else if (selectedFilter === 'external') {
      filteredList = filteredList.filter(source => source.type === 'external');
    }

    // Sort by cited count (descending)
    return filteredList.sort((a, b) => b.citedCount - a.citedCount);
  }, [sources, selectedFilter, totalRuns]);

  // Process data for domain chart - group by domain
  const domainChartData = useMemo(() => {
    if (!sources || sources.length === 0) return [];

    const domainMap = new Map();

    sources.forEach(source => {
      // Extract domain from URL
      let domain;
      try {
        const url = new URL(source.url.startsWith('http') ? source.url : `https://${source.url}`);
        domain = url.hostname;
      } catch {
        // Fallback if URL parsing fails
        domain = source.url.split('/')[0];
      }

      const citedCount = source.citedCount || 0;

      if (domainMap.has(domain)) {
        domainMap.set(domain, domainMap.get(domain) + citedCount);
      } else {
        domainMap.set(domain, citedCount);
      }
    });

    // Convert to array and sort by cited count
    return Array.from(domainMap, ([domain, citedCount]) => ({
      domain,
      citedCount: citedCount
    }))
    .sort((a, b) => b.citedCount - a.citedCount)
    .slice(0, 8); // Top 8 domains
  }, [sources]);

  // Process data for source type pie chart
  const sourceTypeData = useMemo(() => {
    if (!sources || sources.length === 0) return [];

    const typeCounts = {
      owned: 0,
      social: 0,
      external: 0
    };

    sources.forEach(source => {
      if (source.type === 'owned') {
        typeCounts.owned++;
      } else if (source.type === 'social') {
        typeCounts.social++;
      } else if (source.type === 'external') {
        typeCounts.external++;
      }
    });

    const total = typeCounts.owned + typeCounts.social + typeCounts.external;

    return [
      { name: 'Owned', value: typeCounts.owned, percentage: total > 0 ? ((typeCounts.owned / total) * 100).toFixed(1) : 0, fill: '#171717' },
      { name: 'Social', value: typeCounts.social, percentage: total > 0 ? ((typeCounts.social / total) * 100).toFixed(1) : 0, fill: '#525252' },
      { name: 'External', value: typeCounts.external, percentage: total > 0 ? ((typeCounts.external / total) * 100).toFixed(1) : 0, fill: '#a3a3a3' }
    ].filter(item => item.value > 0);
  }, [sources]);

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
      case 'owned':
        return 'Owned';
      case 'social':
        return 'Social';
      case 'external':
        return 'External';
      default:
        return type;
    }
  };

  const getTypeVariant = (type) => {
    switch (type) {
      case 'owned':
        return 'default';
      case 'social':
        return 'secondary';
      case 'external':
        return 'outline';
      default:
        return 'outline';
    }
  };


  const filters = [
    { id: 'all', label: 'All' },
    { id: 'owned', label: 'Owned' },
    { id: 'social', label: 'Social' },
    { id: 'external', label: 'External' },
  ];

  if (loading || sourcesLoading) {
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Most Cited Domains</CardTitle>
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
                  label={{ value: 'Cited Count', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px'
                  }}
                  formatter={(value) => [value, 'Cited Count']}
                />
                <Bar dataKey="citedCount" radius={[8, 8, 0, 0]}>
                  {domainChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDomainColor(entry.domain)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Type Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Source Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={sourceTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={{
                    stroke: '#64748b',
                    strokeWidth: 1
                  }}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={130}
                  innerRadius={60}
                  paddingAngle={0}
                  dataKey="value"
                  animationDuration={500}
                  style={{ fontSize: '14px', fontWeight: '500' }}
                >
                  {sourceTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value, name, props) => [`${value} sources (${props.payload.percentage}%)`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '20px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sources Table with Filters */}
      <div className="space-y-4">
        {/* Header with Title and Filters */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">All Sources</h2>

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

        {/* Table Card */}
        <Card>
          <CardContent className="p-0">
            {filteredSources.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No sources found for this filter
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-auto">Source</TableHead>
                    <TableHead className="text-center w-24">Type</TableHead>
                    <TableHead className="text-right w-32">Cited</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSources.map((source, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium p-0">
                        <a
                          href={source.url.startsWith('http') ? source.url : `https://${source.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-4 hover:bg-secondary/50 transition-colors"
                        >
                          {getFaviconUrl(source.url) && (
                            <img
                              src={getFaviconUrl(source.url)}
                              alt=""
                              className="w-8 h-8 rounded flex-shrink-0 mt-0.5"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          )}
                          <div className="flex flex-col gap-1 min-w-0">
                            {source.title && (
                              <div className="font-semibold text-sm truncate">
                                {source.title}
                              </div>
                            )}
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                              {source.url}
                              <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            </div>
                          </div>
                        </a>
                      </TableCell>
                      <TableCell className="text-center w-24">
                        <Badge variant={getTypeVariant(source.type)} className="text-xs">
                          {getTypeLabel(source.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right w-32">
                        <span className="font-semibold text-base">{source.citedRate}%</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Sources;
