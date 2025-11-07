import { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import MentionChart from '@/components/dashboard/MentionChart';
import RankingChart from '@/components/dashboard/RankingChart';
import ConversationWithCitations from './ConversationWithCitations';
import { ChevronLeft, ChevronRight, ExternalLink, Calendar, Info, CheckCircle, Target } from 'lucide-react';
import { getPromptRuns } from '@/services/dataService';
import { useCompanyId } from '@/hooks/useCompanyId';
import { useCompanyDataStore } from '@/stores';
import { format } from 'date-fns';

const PromptDetail = ({ prompt, selectedRun, setSelectedRun }) => {
  const { companyId } = useCompanyId();
  const company = useCompanyDataStore((state) => state.company);
  const analytics = useCompanyDataStore((state) => state.analytics);
  const [runs, setRuns] = useState([]);
  const [runsLoading, setRunsLoading] = useState(true);
  const [chartData, setChartData] = useState({ mentions: [], rankings: [] });
  const [summaryStats, setSummaryStats] = useState({
    mentionPercentage: 0,
    averagePosition: 0,
    coMentions: []
  });
  const [currentRunGroupIndex, setCurrentRunGroupIndex] = useState(0);
  const [currentIndividualRunIndex, setCurrentIndividualRunIndex] = useState(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

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

  // Get available dates for the date picker
  const availableDates = useMemo(() => {
    return runGroups.map(group => {
      // Parse the date string back to a Date object
      const [month, day, year] = group.date.split(' ');
      return new Date(`${month} ${day.replace(',', '')}, ${year}`);
    });
  }, [runGroups]);

  // Handle date selection from date picker
  const handleDateSelect = (date) => {
    if (!date) return;

    // Format the selected date to match our group date format
    const formattedDate = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Find the matching run group
    const groupIndex = runGroups.findIndex(group => group.date === formattedDate);
    if (groupIndex !== -1) {
      setCurrentRunGroupIndex(groupIndex);
      setCurrentIndividualRunIndex(0); // Reset to first individual run when changing groups
      setDatePickerOpen(false);
    }
  };

  // Get current selected date for the date picker
  const selectedDate = useMemo(() => {
    if (!currentRunGroup) return undefined;
    const [month, day, year] = currentRunGroup.date.split(' ');
    return new Date(`${month} ${day.replace(',', '')}, ${year}`);
  }, [currentRunGroup]);

  // Keyboard navigation with arrow keys
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Only handle arrow keys if not typing in an input/textarea
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (hasPrevious) {
          handlePrevious();
        }
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if (hasNext) {
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasPrevious, hasNext, currentIndividualRunIndex]);

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

  return (
    <div className="space-y-6">
      {/* Prompt Header with Metrics */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-3">{prompt.text}</h1>
        <div className="flex items-center gap-6 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Mention Rate:</span>
            <span className="font-semibold">
              {summaryStats.mentionPercentage || prompt.mentionRate || 0}%
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Avg Position:</span>
            <span className="font-semibold">
              #{summaryStats.averagePosition || prompt.analytics?.averagePosition || '-'}
            </span>
          </div>
        </div>
        <Separator />
      </div>

      {/* Navigation and Date Selector */}
      {currentIndividualRun && currentRunGroup && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[240px] justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => {
                      // Only enable dates that have runs
                      return !availableDates.some(
                        availableDate =>
                          availableDate.toDateString() === date.toDateString()
                      );
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <span>
                        Run {currentIndividualRunIndex + 1} of {currentRunGroup.runs[0]?.detailedRuns?.length || 0}
                      </span>
                      <Info className="h-4 w-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      ChatGPT does not always answer the same way. We run each prompt 10 times and average the results.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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

          {/* Full Width Conversation */}
          <Card>
            <CardContent className="pt-6">
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
                        companyName={company?.name}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">AI Assistant</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cited Sources below conversation */}
          {currentIndividualRun.sources && currentIndividualRun.sources.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-semibold flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Cited Sources
              </h3>
              <div className="space-y-2">
                {currentIndividualRun.sources.map((source) => (
                  <a
                    key={source.id}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 rounded-lg border hover:border-primary/50 hover:bg-accent transition-all group"
                  >
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-primary/10 text-primary rounded-full text-xs font-semibold group-hover:bg-primary/20">
                      {source.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary mb-1 line-clamp-2">
                        {source.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{source.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Charts at the bottom */}
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

    </div>
  );
};

export default PromptDetail;
