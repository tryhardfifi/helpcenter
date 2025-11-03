import { useState, useEffect } from 'react';
import { getCompany, getDataSource } from '@/services/dataService';
import { useCompanyId } from '@/hooks/useCompanyId';
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Database } from 'lucide-react';

const Competitors = () => {
  const { companyId, loading: loadingCompanyId } = useCompanyId();
  const [analytics, setAnalytics] = useState(null);
  const [competitors, setCompetitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (loadingCompanyId) return;

      setLoading(true);
      if (companyId) {
        const company = await getCompany(companyId);
        if (company) {
          setAnalytics(company.analytics);
          setCompetitors(company.competitors);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [companyId, loadingCompanyId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    const isFirestoreMode = !getDataSource();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground mt-1">No data available</p>
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
      </div>
    );
  }

  // Calculate competitor stats
  const getCompetitorStats = (companyKey) => {
    const latestMentions = analytics.mentionsOverTime[analytics.mentionsOverTime.length - 1];
    const latestRanking = analytics.rankingsOverTime[analytics.rankingsOverTime.length - 1];

    // Calculate growth in percentage points
    const firstMentionRate = analytics.mentionsOverTime[0][companyKey];
    const lastMentionRate = latestMentions[companyKey];
    const growth = (lastMentionRate - firstMentionRate).toFixed(1);

    return {
      mentionRate: lastMentionRate,
      ranking: latestRanking[companyKey],
      growth: parseFloat(growth),
    };
  };

  const competitorData = [
    {
      name: 'Acme Inc.',
      key: 'acme',
      isYou: true,
      ...getCompetitorStats('acme'),
    },
    {
      name: 'CompetitorCo',
      key: 'competitorCo',
      isYou: false,
      ...getCompetitorStats('competitorCo'),
    },
    {
      name: 'RivalTech',
      key: 'rivalTech',
      isYou: false,
      ...getCompetitorStats('rivalTech'),
    },
    {
      name: 'IndustryCorp',
      key: 'industryCorp',
      isYou: false,
      ...getCompetitorStats('industryCorp'),
    },
  ].sort((a, b) => a.ranking - b.ranking);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Competitors</h1>
        <p className="text-muted-foreground mt-1">
          Track your position against competitors
        </p>
      </div>

      {/* Competitor Ranking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Competitor Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Company</TableHead>
                <TableHead className="text-right">Mentions</TableHead>
                <TableHead className="text-right">Growth</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitorData.map((company, index) => (
                <TableRow key={company.key} className={company.isYou ? 'bg-secondary' : ''}>
                  <TableCell className="font-bold">#{company.ranking}</TableCell>
                  <TableCell className="font-medium">
                    {company.name}
                    {company.isYou && (
                      <Badge variant="default" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{company.mentions}</TableCell>
                  <TableCell className="text-right">
                    <span className={company.growth > 0 ? 'text-black' : 'text-gray-500'}>
                      {company.growth > 0 ? '+' : ''}{company.growth}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {index === 0 ? (
                      <Badge variant="default">Leader</Badge>
                    ) : company.isYou ? (
                      <Badge variant="secondary">Tracking</Badge>
                    ) : (
                      <Badge variant="outline">Competitor</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mentions Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Mentions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.mentionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  stroke="#000"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#000"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="acme"
                  stroke="#000"
                  strokeWidth={2}
                  name="Acme Inc. (You)"
                  dot={{ fill: '#000', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="competitorCo"
                  stroke="#666"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="CompetitorCo"
                  dot={{ fill: '#666', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="rivalTech"
                  stroke="#999"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="RivalTech"
                  dot={{ fill: '#999', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="industryCorp"
                  stroke="#ccc"
                  strokeWidth={2}
                  name="IndustryCorp"
                  dot={{ fill: '#ccc', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rankings Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Rankings Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.rankingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="date"
                  stroke="#000"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  reversed
                  domain={[1, 10]}
                  stroke="#000"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Rank', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`#${value}`, 'Rank']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="acme"
                  stroke="#000"
                  strokeWidth={2}
                  name="Acme Inc. (You)"
                  dot={{ fill: '#000', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="competitorCo"
                  stroke="#666"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="CompetitorCo"
                  dot={{ fill: '#666', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="rivalTech"
                  stroke="#999"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  name="RivalTech"
                  dot={{ fill: '#999', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="industryCorp"
                  stroke="#ccc"
                  strokeWidth={2}
                  name="IndustryCorp"
                  dot={{ fill: '#ccc', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Market Share */}
      <Card>
        <CardHeader>
          <CardTitle>Market Share (Current Month)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {competitorData.map((company) => {
              const total = competitorData.reduce((sum, c) => sum + c.mentions, 0);
              const percentage = ((company.mentions / total) * 100).toFixed(1);

              return (
                <div key={company.key}>
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{company.name}</span>
                      <span className="text-sm text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full ${company.isYou ? 'bg-black' : 'bg-gray-400'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {company.mentions} mentions
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Competitors;
