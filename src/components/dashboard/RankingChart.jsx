import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RankingChart = ({ data, title = "Rankings Over Time" }) => {
  // Extract all unique keys (company names) from the data
  const getCompanyKeys = () => {
    if (!data || data.length === 0) return [];
    const keys = new Set();
    data.forEach(item => {
      Object.keys(item).forEach(key => {
        if (key !== 'date') keys.add(key);
      });
    });
    return Array.from(keys);
  };

  const companyKeys = getCompanyKeys();

  // Color palette for lines
  const colors = ['#000', '#666', '#999', '#ccc', '#4a5568', '#718096'];
  const dashArrays = ['0', '5 5', '3 3', '8 4', '2 2', '10 5'];

  // Capitalize company name for display
  const formatCompanyName = (key) => {
    return key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim();
  };

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
            {companyKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                strokeDasharray={index === 0 ? '0' : dashArrays[index % dashArrays.length]}
                name={formatCompanyName(key)}
                dot={{ fill: colors[index % colors.length], r: 4 }}
                connectNulls={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default RankingChart;
