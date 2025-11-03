import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MentionChart from '@/components/dashboard/MentionChart';
import RankingChart from '@/components/dashboard/RankingChart';
import RunsTable from './RunsTable';
import RunDetail from './RunDetail';
import { Play } from 'lucide-react';
import { formatRelativeTime } from '@/utils/dateUtils';
import { executePromptRun, getPromptRuns } from '@/services/dataService';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useCompanyData } from '@/contexts/CompanyDataContext';

const PromptDetail = ({ prompt, selectedRun, setSelectedRun }) => {
  const { companyId } = useCompanyId();
  const { company } = useCompanyData();
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [runningPrompt, setRunningPrompt] = useState(false);
  const [chartData, setChartData] = useState({ mentions: [], rankings: [] });
  const [summaryStats, setSummaryStats] = useState({
    mentionPercentage: 0,
    averagePosition: 0,
    coMentions: []
  });

  useEffect(() => {
    loadRuns();
  }, [prompt.id]);

  useEffect(() => {
    if (runs.length > 0 && company) {
      calculateChartData();
    }
  }, [runs, company]);

  const loadRuns = async () => {
    setRunsLoading(true);
    try {
      const fetchedRuns = await getPromptRuns(companyId, prompt.id);
      setRuns(fetchedRuns);
    } catch (error) {
      console.error('Error loading runs:', error);
    } finally {
      setRunsLoading(false);
    }
  };

  const calculateChartData = () => {
    if (!runs.length || !company) return;

    // Sort runs by date (oldest first for chart)
    const sortedRuns = [...runs].sort((a, b) =>
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    const companyName = company.name || 'Acme Inc.';

    // Get unique competitors that actually appear in the runs
    const competitorsInRuns = new Set();
    runs.forEach(run => {
      if (run.competitorMetrics) {
        Object.keys(run.competitorMetrics).forEach(competitorName => {
          competitorsInRuns.add(competitorName);
        });
      }
    });

    // Calculate summary stats
    const runsWithMentions = runs.filter(r => r.position !== null && r.position !== undefined);
    const totalMentions = runsWithMentions.length;
    const mentionPercentage = runs.length > 0 ? Math.round((totalMentions / runs.length) * 100) : 0;
    const averagePosition = totalMentions > 0
      ? Math.round(runsWithMentions.reduce((sum, r) => sum + r.position, 0) / totalMentions)
      : 0;

    // Calculate co-mentions (companies frequently mentioned with us)
    const coMentionCounts = {};
    runs.forEach(run => {
      if (run.competitorMetrics) {
        Object.entries(run.competitorMetrics).forEach(([competitorName, metrics]) => {
          if (metrics.mentionedCount > 0 && run.position) { // Only count if we were also mentioned
            coMentionCounts[competitorName] = (coMentionCounts[competitorName] || 0) + metrics.mentionedCount;
          }
        });
      }
    });

    const coMentions = Object.entries(coMentionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);

    setSummaryStats({
      mentionPercentage,
      averagePosition,
      coMentions
    });

    // Format data for charts - only include competitors that appear in runs
    const mentionsData = sortedRuns.map(run => {
      const dataPoint = {
        date: new Date(run.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        [companyName.toLowerCase().replace(/\s+/g, '')]: run.mentionPercentage || 0
      };

      // Only add competitor data for competitors that exist in runs
      if (run.competitorMetrics) {
        Object.entries(run.competitorMetrics).forEach(([competitorName, metrics]) => {
          if (competitorsInRuns.has(competitorName)) {
            const key = competitorName.toLowerCase().replace(/\s+/g, '');
            dataPoint[key] = Math.round(metrics.mentionPercentage) || 0;
          }
        });
      }

      return dataPoint;
    });

    const rankingsData = sortedRuns.map(run => {
      const dataPoint = {
        date: new Date(run.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        [companyName.toLowerCase().replace(/\s+/g, '')]: run.position || null
      };

      // Only add competitor data for competitors that exist in runs
      if (run.competitorMetrics) {
        Object.entries(run.competitorMetrics).forEach(([competitorName, metrics]) => {
          if (competitorsInRuns.has(competitorName)) {
            const key = competitorName.toLowerCase().replace(/\s+/g, '');
            dataPoint[key] = metrics.averagePosition || null;
          }
        });
      }

      return dataPoint;
    });

    setChartData({
      mentions: mentionsData,
      rankings: rankingsData
    });
  };

  const handleRunPrompt = async () => {
    setRunningPrompt(true);
    try {
      const newRun = await executePromptRun(companyId, prompt.id, {
        text: prompt.text,
        companyName: company?.name || 'Your Company',
        competitors: company?.competitors || []
      });
      setRuns([newRun, ...runs]); // Add to beginning
    } catch (error) {
      console.error('Error running prompt:', error);
      alert('Failed to run prompt');
    } finally {
      setRunningPrompt(false);
    }
  };

  // If a run is selected, show the run detail view
  if (selectedRun) {
    return (
      <RunDetail
        run={selectedRun}
        onBack={() => setSelectedRun(null)}
        promptText={prompt.text}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Prompt Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{prompt.text}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Created {formatRelativeTime(prompt.createdAt)}</span>
                <span>Updated {formatRelativeTime(prompt.lastUpdated)}</span>
              </div>
            </div>
            <Button onClick={handleRunPrompt} disabled={runningPrompt}>
              <Play className="h-4 w-4 mr-2" />
              {runningPrompt ? 'Running...' : 'Run Prompt'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Mention Rate</p>
              <p className="text-2xl font-bold">
                {summaryStats.mentionPercentage || prompt.mentionRate || 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Position</p>
              <p className="text-2xl font-bold">
                #{summaryStats.averagePosition || prompt.analytics?.averagePosition || '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <MentionChart
          data={chartData.mentions.length > 0 ? chartData.mentions : prompt.analytics?.mentionsOverTime || []}
          title="Mentions Over Time"
        />
        <RankingChart
          data={chartData.rankings.length > 0 ? chartData.rankings : prompt.analytics?.rankingsOverTime || []}
          title="Rankings Over Time"
        />
      </div>

      {/* Runs Table */}
      <RunsTable runs={runs} loading={runsLoading} onRunClick={setSelectedRun} />
    </div>
  );
};

export default PromptDetail;
