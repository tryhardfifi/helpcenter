import { useState } from 'react';
import { mockCompanyData } from '@/data/mockData';
import MetricCard from '@/components/dashboard/MetricCard';
import KPIChart from '@/components/dashboard/KPIChart';
import AttributionTable from '@/components/dashboard/AttributionTable';
import TopPromptsTable from '@/components/dashboard/TopPromptsTable';

const Dashboard = () => {
  const { analytics } = mockCompanyData.company;
  const [activeKPI, setActiveKPI] = useState('visibilityScore');

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
        />
        <MetricCard
          title="Mention Rate"
          value={analytics.metrics.promptCoverage}
          suffix="%"
          trend="up"
          onClick={() => setActiveKPI('mentionRate')}
          isActive={activeKPI === 'mentionRate'}
        />
        <MetricCard
          title="Avg. Probability"
          value={analytics.metrics.avgProbability}
          suffix="%"
          trend="up"
          onClick={() => setActiveKPI('avgProbability')}
          isActive={activeKPI === 'avgProbability'}
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

      {/* Attribution Table */}
      <AttributionTable data={analytics.topPages} />

      {/* Top Prompts Table */}
      <TopPromptsTable data={mockCompanyData.prompts} />
    </div>
  );
};

export default Dashboard;
