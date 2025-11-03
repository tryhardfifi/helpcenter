import { formatRelativeTime } from '@/utils/dateUtils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const RunsTable = ({ runs = [], loading = false, onRunClick }) => {
  // Calculate trend compared to previous run
  const getTrend = (currentRun, previousRun) => {
    if (!currentRun.position || !previousRun?.position) return null;
    if (currentRun.position < previousRun.position) return 'up'; // Lower position number is better
    if (currentRun.position > previousRun.position) return 'down';
    return 'same';
  };
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading runs...</p>
        </CardContent>
      </Card>
    );
  }

  if (runs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Run History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No runs yet. Click "Run Prompt" to create the first run.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Run History</CardTitle>
          <span className="text-sm text-muted-foreground">
            {runs.length} total {runs.length === 1 ? 'run' : 'runs'}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Run Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Mention %</TableHead>
              <TableHead className="text-right">Position</TableHead>
              <TableHead className="text-right">Competitors</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {runs.map((run, index) => {
              const previousRun = runs[index + 1];
              const trend = getTrend(run, previousRun);
              const competitorCount = run.competitorMetrics
                ? Object.values(run.competitorMetrics).filter(m => m.mentionedCount > 0).length
                : 0;

              return (
                <TableRow
                  key={run.id}
                  className={onRunClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRunClick && onRunClick(run)}
                >
                  <TableCell className="text-sm">
                    {formatRelativeTime(run.createdAt)}
                  </TableCell>
                  <TableCell>
                    {run.position ? (
                      <Badge variant="default" className="bg-gray-900 hover:bg-black">
                        Mentioned
                      </Badge>
                    ) : (
                      <span className="inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {run.mentionPercentage}%
                  </TableCell>
                  <TableCell className="text-right">
                    {run.position ? (
                      <span className="font-semibold">#{run.position}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {competitorCount > 0 ? `${competitorCount} shown` : '—'}
                  </TableCell>
                  <TableCell className="text-center">
                    {trend === 'up' && (
                      <TrendingUp className="h-4 w-4 text-green-600 mx-auto" />
                    )}
                    {trend === 'down' && (
                      <TrendingDown className="h-4 w-4 text-red-600 mx-auto" />
                    )}
                    {trend === 'same' && (
                      <Minus className="h-4 w-4 text-gray-400 mx-auto" />
                    )}
                    {!trend && (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RunsTable;
