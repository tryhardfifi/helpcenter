import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RankingChart = ({ data, title = "Rankings Over Time" }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
            <XAxis
              dataKey="date"
              stroke="#000"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              reversed
              domain={[1, 10]}
              stroke="#000"
              style={{ fontSize: '12px' }}
              label={{ value: 'Rank', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e5e5',
                borderRadius: '8px'
              }}
              formatter={(value) => [`#${value}`, 'Rank']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="acme"
              stroke="#000"
              strokeWidth={2}
              name="Acme Inc."
              dot={{ fill: '#000', r: 4 }}
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

export default RankingChart;
