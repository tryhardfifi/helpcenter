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
import { ArrowLeft, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';

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
                    <Badge variant="default" className="ml-2 bg-green-600 hover:bg-green-700">
                      #{run.ourCompany.position}
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="ml-2">
                      Not mentioned
                    </Badge>
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
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Status:</span>
                          <Badge variant={run.ourCompany.mentioned ? 'default' : 'secondary'}>
                            {run.ourCompany.mentioned ? 'Mentioned' : 'Not mentioned'}
                          </Badge>
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
                    <div className="space-y-4">
                      {/* User message (prompt) */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <p className="text-sm text-gray-800">{promptText || 'Prompt not available'}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">You</p>
                        </div>
                      </div>

                      {/* Assistant message (GPT response) */}
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Bot className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            {run.conversation ? (
                              <div className="prose prose-sm max-w-none">
                                <ReactMarkdown
                                  components={{
                                    p: ({ children }) => <p className="text-sm text-gray-800 mb-2 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                                    ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                                    li: ({ children }) => <li className="text-sm text-gray-800">{children}</li>,
                                  }}
                                >
                                  {run.conversation}
                                </ReactMarkdown>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No conversation data available</p>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">GPT Assistant</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunDetail;
