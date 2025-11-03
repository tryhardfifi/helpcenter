import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatRelativeTime } from '@/utils/dateUtils';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ConversationWithCitations from './ConversationWithCitations';

const RunDetail = ({ run, onBack, promptText }) => {
  if (!run) return null;

  const { detailedRuns = [], competitorMetrics = {}, mentionPercentage, position, createdAt } = run;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <Button variant="ghost" className="gap-2" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        Back
      </Button>

      <div>
        <h2 className="text-2xl font-bold">Run Details</h2>
        <p className="text-sm text-muted-foreground">
          Executed {formatRelativeTime(createdAt)}
        </p>
      </div>

      {/* Overall Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Results (10 runs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Your Mention %</p>
              <p className="text-2xl font-bold">{mentionPercentage}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Your Avg Position</p>
              <p className="text-2xl font-bold">
                {position ? `#${position}` : 'Not mentioned'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Competitors Tracked</p>
              <p className="text-2xl font-bold">{Object.keys(competitorMetrics).length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Competitor Comparison */}
      {Object.keys(competitorMetrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Competitor Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competitor</TableHead>
                  <TableHead className="text-right">Mention %</TableHead>
                  <TableHead className="text-right">Avg Position</TableHead>
                  <TableHead className="text-right">Times Mentioned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(competitorMetrics).map(([name, metrics]) => (
                  <TableRow key={name}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell className="text-right">
                      {Math.round(metrics.mentionPercentage)}%
                    </TableCell>
                    <TableCell className="text-right">
                      {metrics.averagePosition ? (
                        `#${metrics.averagePosition}`
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{metrics.mentionedCount}/10</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Individual Run Details */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Runs (10 total)</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="run-1" className="w-full">
            <TabsList className="w-full flex-wrap h-auto gap-2">
              {detailedRuns.map((run, idx) => (
                <TabsTrigger
                  key={idx}
                  value={`run-${idx + 1}`}
                  className={`flex-1 ${!run.ourCompany.mentioned ? 'data-[state=inactive]:text-red-600 data-[state=inactive]:border-red-200' : ''}`}
                >
                  Run {idx + 1}
                  {run.ourCompany.mentioned ? (
                    <Badge variant="default" className="ml-2 bg-gray-900 hover:bg-black">
                      #{run.ourCompany.position}
                    </Badge>
                  ) : (
                    <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {detailedRuns.map((run, idx) => (
              <TabsContent key={idx} value={`run-${idx + 1}`} className="space-y-4 mt-4">
                {/* Run Summary */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Your Company</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          {run.ourCompany.mentioned ? (
                            <Badge variant="default" className="bg-gray-900">Mentioned</Badge>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                              <span className="text-sm text-muted-foreground">Not mentioned</span>
                            </div>
                          )}
                        </div>
                        {run.ourCompany.mentioned && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Position:</span>
                            <span className="font-medium">#{run.ourCompany.position}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {run.competitors && run.competitors.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Competitors in This Run</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {run.competitors
                            .filter(c => c.mentioned)
                            .map((competitor, compIdx) => (
                              <div key={compIdx} className="flex justify-between items-center">
                                <span className="text-sm">{competitor.name}</span>
                                <Badge variant="secondary">#{competitor.position}</Badge>
                              </div>
                            ))}
                          {run.competitors.filter(c => c.mentioned).length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No competitors mentioned
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Conversation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Conversation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* User message (prompt) - right aligned */}
                      <div className="flex justify-end">
                        <div className="max-w-[80%]">
                          <div className="bg-gray-100 rounded-2xl px-4 py-3">
                            <p className="text-sm text-gray-900">{promptText || 'Prompt not available'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Assistant message (GPT response) with citations - left aligned, full width */}
                      <div className="space-y-3">
                        <ConversationWithCitations
                          text={run.conversation}
                          annotations={run.annotations}
                          sources={run.sources}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Cited Sources */}
                {run.sources && run.sources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Cited Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {run.sources.map((source) => (
                          <a
                            key={source.id}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors group"
                          >
                            <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full text-xs font-medium group-hover:bg-blue-200">
                              {source.id}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600 mb-1">
                                {source.title}
                              </p>
                              <p className="text-xs text-gray-500 break-all">{source.url}</p>
                            </div>
                            <ExternalLink className="flex-shrink-0 h-4 w-4 text-gray-400 group-hover:text-blue-600" />
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
