import { useState, useMemo } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { getDataSource, executePromptRun, getAllPromptRuns, saveAnalytics } from '@/services/dataService';
import { runAllPromptsAndComputeAnalytics } from '@/services/bulkPromptRunner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, Play, Trophy, CheckCircle, Target } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import KPIChart from '@/components/dashboard/KPIChart';
import AttributionTable from '@/components/dashboard/AttributionTable';
import TopPromptsTable from '@/components/dashboard/TopPromptsTable';

const Dashboard = () => {
  const { company, prompts, analytics, loading, refetch } = useCompanyData();
  const [activeKPI, setActiveKPI] = useState('visibilityRank');
  const [runningAllPrompts, setRunningAllPrompts] = useState(false);
  const [bulkRunProgress, setBulkRunProgress] = useState({ current: 0, total: 0 });

  const hasAnalytics = analytics && analytics.metrics;

  // Calculate visibility rank based on visibility score compared to competitors
  const visibilityRankData = useMemo(() => {
    if (!hasAnalytics) return { rank: null, total: 0 };

    const companyScore = analytics.metrics.visibilityScore || 0;
    const competitors = analytics.competitors || [];

    // Create array of all companies with their scores
    const allScores = [
      { name: company?.name, score: companyScore, isOurCompany: true },
      ...competitors.map(comp => ({
        name: comp.name || comp,
        score: analytics.metrics[comp.name || comp]?.visibilityScore ||
               analytics.metrics.competitors?.[comp.name || comp]?.visibilityScore || 0,
        isOurCompany: false
      }))
    ];

    // Sort by score descending (highest score = rank 1)
    allScores.sort((a, b) => b.score - a.score);

    // Find our company's rank
    const ourRank = allScores.findIndex(item => item.isOurCompany) + 1;

    return { rank: ourRank, total: allScores.length };
  }, [hasAnalytics, analytics, company]);

  // Calculate mention details (times mentioned out of total)
  const mentionDetails = useMemo(() => {
    if (!hasAnalytics) return { mentioned: 0, total: 0 };

    const totalMentions = analytics.metrics.totalMentions || 0;
    const totalRuns = analytics.metrics.totalRuns || 0;

    return { mentioned: totalMentions, total: totalRuns };
  }, [hasAnalytics, analytics]);

  const handleRunAllPrompts = async () => {
    if (!company) {
      alert('No company data found');
      return;
    }

    if (!prompts || prompts.length === 0) {
      alert('No prompts found. Please create some prompts first.');
      return;
    }

    console.log('🚀 Starting Run All Prompts...');
    console.log('Company:', company.name, 'Prompts:', prompts.length, 'Competitors:', analytics?.competitors?.length || 0);

    setRunningAllPrompts(true);
    setBulkRunProgress({ current: 0, total: prompts.length });

    try {
      // Progress callback
      const onProgress = (message, current, total) => {
        console.log(`📊 Progress: ${message} (${current}/${total})`);
        setBulkRunProgress({ current, total });
      };

      // Execute prompt run function wrapper (uses existing executePromptRun)
      const executePromptRunFn = async (promptId, promptData) => {
        console.log(`▶️  Executing prompt ${promptId}...`);
        const result = await executePromptRun(company.id, promptId, promptData);
        console.log(`✅ Completed prompt ${promptId}`);
        return result;
      };

      // Get all runs function wrapper
      const getAllRunsFn = async () => {
        console.log('📥 Fetching all runs...');
        const runs = await getAllPromptRuns(company.id);
        console.log(`📦 Found ${runs.length} total runs`);
        return runs;
      };

      // Save analytics function wrapper
      const saveAnalyticsFn = async (date, analyticsData) => {
        console.log(`💾 Saving analytics for ${date}...`);
        const result = await saveAnalytics(company.id, date, analyticsData);
        console.log('✅ Analytics saved');
        return result;
      };

      // Run all prompts and compute analytics
      console.log('🎯 Calling bulk runner...');
      const results = await runAllPromptsAndComputeAnalytics({
        companyId: company.id,
        companyName: company.name,
        prompts: prompts,
        competitors: analytics?.competitors || [], // Use competitors from analytics
        executePromptRunFn,
        getAllRunsFn,
        saveAnalyticsFn,
        onProgress
      });

      console.log('📊 Results:', results);
      console.log(`✅ Success: ${results.successfulRuns}/${results.totalPrompts}`);
      console.log(`❌ Failed: ${results.failedRuns}`);

      if (results.errors.length > 0) {
        console.error('Errors:', results.errors);
      }

      // Refresh company data to show updated data
      console.log('🔄 Refreshing data...');
      await refetch();
      console.log('✅ Data refreshed');

      alert(`Completed! ${results.successfulRuns} prompts run successfully, ${results.failedRuns} failed.`);
    } catch (error) {
      console.error('❌ Error running all prompts:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setRunningAllPrompts(false);
      setBulkRunProgress({ current: 0, total: 0 });
    }
  };

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

  if (!company) {
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
    visibilityRank: analytics?.rankingsOverTime || [],
    mentioned: analytics?.mentionsOverTime || [],
    position: analytics?.rankingsOverTime || [],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your AI mentions and rankings
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button
            onClick={handleRunAllPrompts}
            disabled={runningAllPrompts || !prompts || prompts.length === 0}
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            {runningAllPrompts ? 'Running...' : 'Run All Prompts'}
          </Button>
          {runningAllPrompts && bulkRunProgress.total > 0 && (
            <div className="text-sm text-muted-foreground">
              {bulkRunProgress.current}/{bulkRunProgress.total} prompts
            </div>
          )}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Visibility Rank"
          value={visibilityRankData.rank ? visibilityRankData.rank : '-'}
          subtitle={visibilityRankData.total > 0 ? `out of ${visibilityRankData.total} competitors` : ''}
          icon={Trophy}
          trend="up"
          onClick={() => setActiveKPI('visibilityRank')}
          isActive={activeKPI === 'visibilityRank'}
        />
        <MetricCard
          title="Mentioned"
          value={hasAnalytics ? analytics.metrics.promptCoverage : '-'}
          suffix={hasAnalytics ? '%' : ''}
          subtitle={mentionDetails.total > 0 ? `${mentionDetails.mentioned} out of ${mentionDetails.total} times you're mentioned` : ''}
          icon={CheckCircle}
          trend="up"
          onClick={() => setActiveKPI('mentioned')}
          isActive={activeKPI === 'mentioned'}
        />
        <MetricCard
          title="Average Position"
          value={hasAnalytics && analytics.metrics.avgRank ? analytics.metrics.avgRank : '-'}
          subtitle="when mentioned"
          icon={Target}
          trend="stable"
          onClick={() => setActiveKPI('position')}
          isActive={activeKPI === 'position'}
        />
      </div>

      {/* Dynamic KPI Chart */}
      <KPIChart
        data={kpiDataMap[activeKPI]}
        kpiType={activeKPI}
      />

      {/* Top Prompts Table */}
      <TopPromptsTable data={prompts} company={company} analytics={analytics} />

      {/* Top Sources Table */}
      <AttributionTable data={analytics?.topSources || []} title="Top Sources" company={company} analytics={analytics} />
    </div>
  );
};

export default Dashboard;
