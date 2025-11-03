import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const TopPromptsTable = ({ data, title = "Top Prompts" }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendVariant = (trend) => {
    switch (trend) {
      case 'up':
        return 'default';
      case 'down':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Sort prompts by mentionRate (probability) in descending order
  const sortedData = [...data].sort((a, b) => b.mentionRate - a.mentionRate);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt</TableHead>
              <TableHead className="text-right">Avg. Probability</TableHead>
              <TableHead className="text-center">Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((prompt, index) => (
              <TableRow key={prompt.id || index}>
                <TableCell className="font-medium max-w-md">{prompt.text}</TableCell>
                <TableCell className="text-right font-semibold">{prompt.mentionRate}%</TableCell>
                <TableCell className="text-center">
                  <Badge variant={getTrendVariant(prompt.trend)} className="gap-1">
                    {getTrendIcon(prompt.trend)}
                    {prompt.trend}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TopPromptsTable;
