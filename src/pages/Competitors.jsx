import { useMemo } from 'react';
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getBarColor } from '@/lib/colors';

const Competitors = () => {
  const { company, analytics, loading } = useCompanyData();

  // Process competitor data from analytics
  const competitorData = useMemo(() => {
    if (!analytics) return [];

    // Get the latest data points (June/last month)
    const latestVisibility = analytics.visibilityScoreOverTime?.[analytics.visibilityScoreOverTime.length - 1];
    const latestMentions = analytics.mentionsOverTime?.[analytics.mentionsOverTime.length - 1];
    const latestRankings = analytics.rankingsOverTime?.[analytics.rankingsOverTime.length - 1];

    if (!latestVisibility || !latestMentions || !latestRankings) return [];

    // Extract all competitor names from the analytics data
    const dataKeys = Object.keys(latestVisibility).filter(key => key !== 'date');

    // Create array of competitors with your company first (first key is assumed to be our company)
    const competitors = dataKeys.map((dataKey, index) => {
      const isOwn = index === 0; // First competitor is our company
      const displayName = dataKey.charAt(0).toUpperCase() + dataKey.slice(1).replace(/([A-Z])/g, ' $1').trim();

      return {
        id: isOwn ? 'own' : `comp-${index}`,
        name: isOwn ? (company.name || displayName) : displayName,
        visibilityScore: latestVisibility[dataKey] || 0,
        mentionRate: latestMentions[dataKey] || 0,
        averageRank: latestRankings[dataKey] || 0,
        isOwn
      };
    });

    return competitors;
  }, [company, analytics]);

  // Prepare data for mention rate chart (top 5)
  const mentionRateChartData = useMemo(() => {
    return [...competitorData]
      .sort((a, b) => b.mentionRate - a.mentionRate)
      .slice(0, 5)
      .map((comp, index) => ({
        name: comp.name,
        mentionRate: comp.mentionRate,
        isOwn: comp.isOwn,
        colorIndex: index
      }));
  }, [competitorData]);

  // Prepare data for average rank chart (top 5 - lower rank is better)
  const averageRankChartData = useMemo(() => {
    const filteredData = [...competitorData]
      .filter(comp => comp.averageRank > 0); // Only include those with a rank

    return filteredData
      .sort((a, b) => a.averageRank - b.averageRank) // Lower rank is better
      .slice(0, 5)
      .map((comp, index) => ({
        name: comp.name,
        averageRank: comp.averageRank, // Keep actual rank for tooltip
        invertedRank: 11 - comp.averageRank, // Rank 1 = 10, Rank 10 = 1
        isOwn: comp.isOwn,
        colorIndex: index
      }));
  }, [competitorData]);

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
        <h1 className="text-3xl font-bold">Competitors</h1>
        <p className="text-muted-foreground mt-1">
          Track your performance against competitors across key metrics
        </p>
      </div>

      {/* Competitors Table */}
      <Card>
        <CardContent className="p-0">
          {competitorData.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No competitor data available
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead className="text-right">Visibility Score</TableHead>
                  <TableHead className="text-right">Mention Rate (%)</TableHead>
                  <TableHead className="text-right">Average Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitorData.map((competitor) => (
                  <TableRow key={competitor.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {competitor.name}
                        {competitor.isOwn && (
                          <Badge variant="default" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {competitor.visibilityScore.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {competitor.mentionRate.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {competitor.averageRank > 0 ? competitor.averageRank : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mention Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Mention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={mentionRateChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="name"
                  stroke="#000"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
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
                  formatter={(value) => [`${value.toFixed(1)}%`, 'Mention Rate']}
                />
                <Bar dataKey="mentionRate" radius={[8, 8, 0, 0]}>
                  {mentionRateChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.isOwn, entry.colorIndex)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Average Rank Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Average Rank</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={averageRankChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="name"
                  stroke="#000"
                  style={{ fontSize: '12px' }}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="#000"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Average Rank', angle: -90, position: 'insideLeft' }}
                  domain={[0, 10]}
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
                  tickFormatter={(value) => (value > 0 ? 11 - value : '')}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name, props) => [`Rank #${props.payload.averageRank}`, 'Average Rank']}
                />
                <Bar dataKey="invertedRank" radius={[8, 8, 0, 0]}>
                  {averageRankChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.isOwn, entry.colorIndex)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Competitors;
