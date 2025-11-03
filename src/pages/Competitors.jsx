import { useState } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { getDataSource, createCompetitor } from '@/services/dataService';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Database, Plus } from 'lucide-react';

const Competitors = () => {
  const { company, loading, refetch } = useCompanyData();
  const { companyId } = useCompanyId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const analytics = company?.analytics;
  const competitors = company?.competitors || [];

  const handleCreateCompetitor = async (e) => {
    e.preventDefault();
    setError('');

    // Validate URL
    try {
      new URL(competitorUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsSubmitting(true);

    try {
      await createCompetitor(companyId, competitorUrl);
      setIsModalOpen(false);
      setCompetitorUrl('');
      refetch(); // Refresh the company data
    } catch (err) {
      setError(err.message || 'Failed to create competitor');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitors</h1>
          <p className="text-muted-foreground mt-1">
            Track your position against competitors
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Competitor
        </Button>
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

      {/* Create Competitor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Competitor</DialogTitle>
            <DialogDescription>
              Enter the URL of a competitor website to track their performance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCompetitor}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="competitor-url">Competitor URL</Label>
                <Input
                  id="competitor-url"
                  type="url"
                  placeholder="https://example.com"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  required
                  className="mt-1.5"
                />
                {error && (
                  <p className="text-sm text-red-600 mt-2">{error}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsModalOpen(false);
                  setCompetitorUrl('');
                  setError('');
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !competitorUrl.trim()}>
                {isSubmitting ? 'Adding...' : 'Add Competitor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Competitors;
