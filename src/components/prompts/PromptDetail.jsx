import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MentionChart from '@/components/dashboard/MentionChart';
import RankingChart from '@/components/dashboard/RankingChart';
import ConversationWithCitations from './ConversationWithCitations';
import { Play, ChevronLeft, ChevronRight, ExternalLink, CheckCircle2, XCircle, Users, Calendar } from 'lucide-react';
import { formatRelativeTime } from '@/utils/dateUtils';
import { executePromptRun, getPromptRuns } from '@/services/dataService';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useCompanyData } from '@/contexts/CompanyDataContext';

const PromptDetail = ({ prompt, selectedRun, setSelectedRun }) => {
  const { companyId } = useCompanyId();
  const { company, analytics } = useCompanyData();
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [runningPrompt, setRunningPrompt] = useState(false);
  const [chartData, setChartData] = useState({ mentions: [], rankings: [] });
  const [summaryStats, setSummaryStats] = useState({
    mentionPercentage: 0,
    averagePosition: 0,
    coMentions: []
  });
  const [currentRunGroupIndex, setCurrentRunGroupIndex] = useState(0);
  const [currentIndividualRunIndex, setCurrentIndividualRunIndex] = useState(0);

  // Group runs by date
  const runGroups = useMemo(() => {
    if (!runs.length) return [];

    const groups = new Map();
    runs.forEach(run => {
      const date = new Date(run.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date).push(run);
    });

    // Convert to array and sort by date (most recent first)
    return Array.from(groups.entries())
      .sort((a, b) => new Date(b[1][0].createdAt) - new Date(a[1][0].createdAt))
      .map(([date, runs]) => ({ date, runs }));
  }, [runs]);

  // Initialize with first run of today or most recent run
  useEffect(() => {
    if (runGroups.length > 0) {
      const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      const todayIndex = runGroups.findIndex(group => group.date === today);

      if (todayIndex !== -1) {
        // Show first individual run of today
        setCurrentRunGroupIndex(todayIndex);
        setCurrentIndividualRunIndex(0);
      } else {
        // Show first individual run of most recent run group
        setCurrentRunGroupIndex(0);
        setCurrentIndividualRunIndex(0);
      }
    }
  }, [runGroups]);

  const currentRunGroup = useMemo(() => {
    if (!runGroups.length) return null;
    return runGroups[currentRunGroupIndex];
  }, [runGroups, currentRunGroupIndex]);

  const currentIndividualRun = useMemo(() => {
    if (!currentRunGroup?.runs[0]?.detailedRuns) return null;
    return currentRunGroup.runs[0].detailedRuns[currentIndividualRunIndex];
  }, [currentRunGroup, currentIndividualRunIndex]);

  // Navigation handlers for individual runs
  const handlePrevious = () => {
    if (currentIndividualRunIndex > 0) {
      setCurrentIndividualRunIndex(currentIndividualRunIndex - 1);
    }
  };

  const handleNext = () => {
    const totalIndividualRuns = currentRunGroup?.runs[0]?.detailedRuns?.length || 0;
    if (currentIndividualRunIndex < totalIndividualRuns - 1) {
      setCurrentIndividualRunIndex(currentIndividualRunIndex + 1);
    }
  };

  const hasPrevious = currentIndividualRunIndex > 0;
  const hasNext = currentIndividualRunIndex < (currentRunGroup?.runs[0]?.detailedRuns?.length - 1 || 0);

  // Handle run group change
  const handleRunGroupChange = (value) => {
    const newIndex = parseInt(value, 10);
    setCurrentRunGroupIndex(newIndex);
    setCurrentIndividualRunIndex(0); // Reset to first individual run when changing groups
  };

  // Get display label for run group
  const getRunGroupLabel = (date) => {
    const today = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return date === today ? 'Today' : date;
  };

  useEffect(() => {
    console.log('[PromptDetail] useEffect triggered - companyId:', companyId, 'promptId:', prompt.id);
    if (companyId && prompt.id) {
      loadRuns();
    }
  }, [prompt.id, companyId]);

  useEffect(() => {
    if (runs.length > 0 && company) {
      calculateChartData();
    }
  }, [runs, company]);

  const loadRuns = async () => {
    console.log('[PromptDetail] Loading runs for:', { companyId, promptId: prompt.id });
    setRunsLoading(true);
    try {
      const fetchedRuns = await getPromptRuns(companyId, prompt.id);
      console.log('[PromptDetail] Fetched runs:', fetchedRuns.length, 'runs');
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

    // Calculate summary stats - average the mentionPercentage and position from all runs
    const mentionPercentage = runs.length > 0
      ? Math.round(runs.reduce((sum, r) => sum + (r.mentionPercentage || 0), 0) / runs.length)
      : 0;

    // Average position from all runs (only count runs where position exists)
    const runsWithPosition = runs.filter(r => r.position !== null && r.position !== undefined);
    const averagePosition = runsWithPosition.length > 0
      ? Math.round(runsWithPosition.reduce((sum, r) => sum + r.position, 0) / runsWithPosition.length)
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
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
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
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
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
        competitors: analytics?.competitors || []  // ← Use competitors from analytics
      });

      // Reload all runs to get the updated list
      await loadRuns();
    } catch (error) {
      console.error('Error running prompt:', error);
      alert('Failed to run prompt');
    } finally {
      setRunningPrompt(false);
    }
  };

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
          title="Position Over Time"
        />
      </div>

      {/* Current Individual Run Details with Navigation */}
      {currentIndividualRun && currentRunGroup && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-xl">Run Details</CardTitle>
                <CardDescription>
                  Run {currentIndividualRunIndex + 1} of {currentRunGroup.runs[0]?.detailedRuns?.length || 0}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasPrevious}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={String(currentRunGroupIndex)} onValueChange={handleRunGroupChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select date" />
                </SelectTrigger>
                <SelectContent>
                  {runGroups.map((group, index) => (
                    <SelectItem key={index} value={String(index)}>
                      {getRunGroupLabel(group.date)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Run Summary */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {currentIndividualRun.ourCompany.mentioned ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        Your Company
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-destructive" />
                        Your Company
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      {currentIndividualRun.ourCompany.mentioned ? (
                        <Badge className="bg-primary">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mentioned
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Not Mentioned
                        </Badge>
                      )}
                    </div>
                    {currentIndividualRun.ourCompany.mentioned && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-muted-foreground">Position</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-base font-mono font-bold">
                              #{currentIndividualRun.ourCompany.position}
                            </Badge>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {currentIndividualRun.competitors && currentIndividualRun.competitors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Competitors in This Run
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentIndividualRun.competitors
                        .filter(c => c.mentioned)
                        .sort((a, b) => a.position - b.position)
                        .map((competitor, compIdx) => (
                          <div
                            key={compIdx}
                            className="flex justify-between items-center p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <span className="text-sm font-medium">{competitor.name}</span>
                            <Badge variant="outline" className="font-mono">
                              #{competitor.position}
                            </Badge>
                          </div>
                        ))}
                      {currentIndividualRun.competitors.filter(c => c.mentioned).length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-muted-foreground">
                            No competitors mentioned in this run
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator />

            {/* Conversation */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Conversation</CardTitle>
                <CardDescription>Exchange between user and AI assistant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* User message (prompt) - right aligned */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%]">
                      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-5 py-3 shadow-sm">
                        <p className="text-sm leading-relaxed">{prompt.text || 'Prompt not available'}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 text-right">You</p>
                    </div>
                  </div>

                  {/* Assistant message (GPT response) with citations - left aligned */}
                  <div className="flex justify-start">
                    <div className="max-w-[85%]">
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                        <ConversationWithCitations
                          text={currentIndividualRun.conversation}
                          annotations={currentIndividualRun.annotations}
                          sources={currentIndividualRun.sources}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">AI Assistant</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cited Sources */}
            {currentIndividualRun.sources && currentIndividualRun.sources.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Cited Sources
                  </CardTitle>
                  <CardDescription>
                    {currentIndividualRun.sources.length} source{currentIndividualRun.sources.length !== 1 ? 's' : ''} referenced in this conversation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentIndividualRun.sources.map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-4 rounded-lg border hover:border-primary/50 hover:bg-accent transition-all group"
                      >
                        <div className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-semibold group-hover:bg-primary/20">
                          {source.id}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary mb-1 line-clamp-2">
                            {source.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                        </div>
                        <ExternalLink className="flex-shrink-0 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default PromptDetail;
