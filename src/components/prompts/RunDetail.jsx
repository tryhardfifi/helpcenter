import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { formatRelativeTime } from '@/utils/dateUtils';
import { ArrowLeft, ExternalLink, CheckCircle2, XCircle, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConversationWithCitations from './ConversationWithCitations';

const RunDetail = ({ run, onBack, promptText }) => {
  if (!run) return null;

  const { detailedRuns = [], competitorMetrics = {}, mentionPercentage, position, createdAt } = run;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" className="gap-2 hover:bg-accent" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back to Runs
        </Button>
        <div className="text-sm text-muted-foreground">
          {formatRelativeTime(createdAt)}
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Run Details</h2>
        <p className="text-muted-foreground">
          Comprehensive analysis of 10 individual runs
        </p>
      </div>

      <Separator />

      {/* Overall Summary */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl">Performance Overview</CardTitle>
          <CardDescription>Aggregate metrics across all 10 runs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                Your Mention Rate
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{mentionPercentage}%</p>
                <span className="text-sm text-muted-foreground">of runs</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                Average Position
              </div>
              <div className="flex items-baseline gap-2">
                {position ? (
                  <>
                    <p className="text-3xl font-bold">#{position}</p>
                    <Badge variant="secondary" className="text-xs">
                      When mentioned
                    </Badge>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-muted-foreground">N/A</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Users className="h-4 w-4" />
                Competitors Tracked
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{Object.keys(competitorMetrics).length}</p>
                <span className="text-sm text-muted-foreground">companies</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Comparison */}
      {Object.keys(competitorMetrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Competitor Performance</CardTitle>
            <CardDescription>How competitors performed across all runs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Competitor</TableHead>
                    <TableHead className="text-right font-semibold">Mention Rate</TableHead>
                    <TableHead className="text-right font-semibold">Avg Position</TableHead>
                    <TableHead className="text-right font-semibold">Mentions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(competitorMetrics)
                    .sort((a, b) => b[1].mentionPercentage - a[1].mentionPercentage)
                    .map(([name, metrics]) => (
                      <TableRow key={name} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{name}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-semibold">{Math.round(metrics.mentionPercentage)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {metrics.averagePosition ? (
                            <Badge variant="outline" className="font-mono">
                              #{metrics.averagePosition}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">Not mentioned</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm text-muted-foreground">
                            {metrics.mentionedCount} / 10
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Run Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Individual Run Analysis</CardTitle>
          <CardDescription>Detailed breakdown of each of the 10 runs</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="run-1" className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-2 bg-muted p-2">
              {detailedRuns.map((run, idx) => (
                <TabsTrigger
                  key={idx}
                  value={`run-${idx + 1}`}
                  className={`flex items-center gap-2 flex-1 min-w-[90px] data-[state=active]:bg-background ${
                    !run.ourCompany.mentioned
                      ? 'data-[state=inactive]:text-destructive data-[state=inactive]:opacity-75'
                      : ''
                  }`}
                >
                  <span>Run {idx + 1}</span>
                  {run.ourCompany.mentioned ? (
                    <Badge variant="secondary" className="text-xs font-mono">
                      #{run.ourCompany.position}
                    </Badge>
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {detailedRuns.map((run, idx) => (
              <TabsContent key={idx} value={`run-${idx + 1}`} className="space-y-6 mt-6">
                {/* Run Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className={run.ourCompany.mentioned ? 'border-primary/20' : 'border-destructive/20'}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {run.ourCompany.mentioned ? (
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
                          {run.ourCompany.mentioned ? (
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
                        {run.ourCompany.mentioned && (
                          <>
                            <Separator />
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-muted-foreground">Position</span>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-base font-mono font-bold">
                                  #{run.ourCompany.position}
                                </Badge>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {run.competitors && run.competitors.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Competitors in This Run
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {run.competitors
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
                          {run.competitors.filter(c => c.mentioned).length === 0 && (
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
                            <p className="text-sm leading-relaxed">{promptText || 'Prompt not available'}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 text-right">You</p>
                        </div>
                      </div>

                      {/* Assistant message (GPT response) with citations - left aligned */}
                      <div className="flex justify-start">
                        <div className="max-w-[85%]">
                          <div className="bg-muted rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                            <ConversationWithCitations
                              text={run.conversation}
                              annotations={run.annotations}
                              sources={run.sources}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">AI Assistant</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cited Sources */}
                {run.sources && run.sources.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Cited Sources
                      </CardTitle>
                      <CardDescription>
                        {run.sources.length} source{run.sources.length !== 1 ? 's' : ''} referenced in this conversation
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {run.sources.map((source) => (
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
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunDetail;
