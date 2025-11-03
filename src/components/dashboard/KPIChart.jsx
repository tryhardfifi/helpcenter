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
            <Line
              type="monotone"
              dataKey="acme"
              stroke="#000"
              strokeWidth={3}
              name="Acme Inc."
              dot={{ fill: '#000', r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="competitorCo"
              stroke="#666"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="CompetitorCo"
              dot={{ fill: '#666', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="rivalTech"
              stroke="#999"
              strokeWidth={2}
              strokeDasharray="3 3"
              name="RivalTech"
              dot={{ fill: '#999', r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="industryCorp"
              stroke="#ccc"
              strokeWidth={2}
              name="IndustryCorp"
              dot={{ fill: '#ccc', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default KPIChart;
