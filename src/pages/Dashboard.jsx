import { mockCompanyData } from '@/data/mockData';
import MetricCard from '@/components/dashboard/MetricCard';
import MentionChart from '@/components/dashboard/MentionChart';
import RankingChart from '@/components/dashboard/RankingChart';
import AttributionTable from '@/components/dashboard/AttributionTable';

const Dashboard = () => {
  const { analytics } = mockCompanyData.company;

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
        />
        <MetricCard
          title="Mention Rate"
          value={analytics.metrics.promptCoverage}
          suffix="%"
          trend="up"
        />
        <MetricCard
          title="Avg. Probability"
          value={analytics.metrics.avgProbability}
          suffix="%"
          trend="up"
        />
        <MetricCard
          title="Avg. Rank"
          value={`#${analytics.metrics.avgRank}`}
          trend="stable"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <MentionChart data={analytics.mentionsOverTime} />
        <RankingChart data={analytics.rankingsOverTime} />
      </div>

      {/* Attribution Table */}
      <AttributionTable data={analytics.topPages} />
    </div>
  );
};

export default Dashboard;
