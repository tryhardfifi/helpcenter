import { useState } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { getDataSource } from '@/services/dataService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import KPIChart from '@/components/dashboard/KPIChart';
import AttributionTable from '@/components/dashboard/AttributionTable';
import TopPromptsTable from '@/components/dashboard/TopPromptsTable';

const Dashboard = () => {
  const { company, prompts, loading } = useCompanyData();
  const [activeKPI, setActiveKPI] = useState('visibilityScore');

  const analytics = company?.analytics;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
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
          <h1 className="text-3xl font-bold">Dashboard</h1>
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

  // Map KPI types to their corresponding data
  const kpiDataMap = {
    visibilityScore: analytics.visibilityScoreOverTime,
    mentionRate: analytics.mentionsOverTime,
    avgProbability: analytics.avgProbabilityOverTime,
    avgRank: analytics.rankingsOverTime,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your AI mentions and rankings
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Visibility Score"
          value={analytics.metrics.visibilityScore}
          suffix=""
          trend="up"
          onClick={() => setActiveKPI('visibilityScore')}
          isActive={activeKPI === 'visibilityScore'}
          info="The visibility score is calculated from the % of prompts you rank, the average probability for you to appear and the position of your business compared to your competitors. It helps compare the overall AI visibility between you and your competitors."
        />
        <MetricCard
          title="Mention Rate"
          value={analytics.metrics.promptCoverage}
          suffix="%"
          trend="up"
          onClick={() => setActiveKPI('mentionRate')}
          isActive={activeKPI === 'mentionRate'}
          info="The share of prompts that your business can appear in."
        />
        <MetricCard
          title="Probability to Appear"
          value={analytics.metrics.avgProbability}
          suffix="%"
          trend="up"
          onClick={() => setActiveKPI('avgProbability')}
          isActive={activeKPI === 'avgProbability'}
          info="For the prompts that your business does appear in, how likely it is to show up. This is because AI never responds the exact same way, so you might sometimes appear and sometimes not. If this number is higher, it means your business is more of a leader in your niche."
        />
        <MetricCard
          title="Avg. Rank"
          value={`#${analytics.metrics.avgRank}`}
          trend="stable"
          onClick={() => setActiveKPI('avgRank')}
          isActive={activeKPI === 'avgRank'}
        />
      </div>

      {/* Dynamic KPI Chart */}
      <KPIChart
        data={kpiDataMap[activeKPI]}
        kpiType={activeKPI}
      />

      {/* Top Prompts Table */}
      <TopPromptsTable data={prompts} company={company} />

      {/* Top Sources Table */}
      <AttributionTable data={analytics.topSources} title="Top Sources" company={company} />
    </div>
  );
};

export default Dashboard;
