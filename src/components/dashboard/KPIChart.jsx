import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const KPIChart = ({ data, title, kpiType }) => {
  // Configuration for different KPI types
  const kpiConfig = {
    visibilityScore: {
      title: 'Visibility Score Over Time',
      yAxisLabel: 'Score',
      tooltipSuffix: '',
      reversed: false,
      domain: null,
    },
    mentionRate: {
      title: 'Mention Rate Over Time',
      yAxisLabel: 'Mention Rate (%)',
      tooltipSuffix: '%',
      reversed: false,
      domain: null,
    },
    avgProbability: {
      title: 'Average Probability Over Time',
      yAxisLabel: 'Probability (%)',
      tooltipSuffix: '%',
      reversed: false,
      domain: null,
    },
    avgRank: {
      title: 'Average Rankings Over Time',
      yAxisLabel: 'Rank',
      tooltipSuffix: '',
      reversed: true,
      domain: [1, 10],
    },
  };

  const config = kpiConfig[kpiType] || kpiConfig.visibilityScore;
  const displayTitle = title || config.title;

  // Check if we have data
  const hasData = data && data.length > 0;

  // Extract all data keys (companies) from the data dynamically
  const dataKeys = hasData
    ? Object.keys(data[0]).filter(key => key !== 'date')
    : [];

  // Color palette for lines - first is always the main company (black, thicker)
  const colors = ['#000', '#2563eb', '#dc2626', '#16a34a', '#ea580c', '#9333ea', '#0891b2', '#ca8a04'];
  const strokeWidths = [3, 2, 2, 2, 2, 2, 2, 2];
  const dashArrays = [null, '5 5', '3 3', null, '5 5', '3 3', null, '5 5'];

  // Custom tooltip formatter based on KPI type
  const tooltipFormatter = (value, name) => {
    if (kpiType === 'avgRank') {
      return [`#${value}`, name];
    }
    return [`${value}${config.tooltipSuffix}`, name];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis
                dataKey="date"
                stroke="#000"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                reversed={config.reversed}
                domain={config.domain}
                stroke="#000"
                style={{ fontSize: '12px' }}
                label={{ value: config.yAxisLabel, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px'
                }}
                formatter={tooltipFormatter}
              />
              <Legend />
              {dataKeys.map((key, index) => {
                // Format the name for display
                // Convert camelCase/lowercase to proper Title Case
                const displayName = key
                  .replace(/([A-Z])/g, ' $1') // Add space before capital letters
                  .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
                  .trim();

                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={strokeWidths[index % strokeWidths.length]}
                    strokeDasharray={dashArrays[index % dashArrays.length]}
                    name={displayName}
                    dot={{ fill: colors[index % colors.length], r: index === 0 ? 5 : 4 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium mb-2">No analytics data yet</p>
              <p className="text-sm">Run "Run All Prompts" to generate analytics</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KPIChart;
