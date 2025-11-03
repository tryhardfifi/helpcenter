import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const ArticleDetail = ({ article }) => {
  const getImpactVariant = (impact) => {
    switch (impact) {
      case 'high':
        return 'default';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const sentimentData = [
    { name: 'Positive', value: article.analytics.sentimentBreakdown.positive, color: '#000' },
    { name: 'Neutral', value: article.analytics.sentimentBreakdown.neutral, color: '#666' },
    { name: 'Negative', value: article.analytics.sentimentBreakdown.negative, color: '#ccc' },
  ];

  return (
    <div className="space-y-6">
      {/* Article Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{article.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <span>Published: {new Date(article.publishDate).toLocaleDateString()}</span>
                <a
                  href={`https://${article.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  {article.url}
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {article.topics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
            <Badge variant={getImpactVariant(article.impact)} className="shrink-0 capitalize">
              {article.impact} Impact
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Mentions</p>
              <p className="text-3xl font-bold">{article.mentions}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Ranking</p>
              <p className="text-3xl font-bold">#{article.analytics.averageRanking}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Positive Sentiment</p>
              <p className="text-3xl font-bold">{article.analytics.sentimentBreakdown.positive}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Mentions Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Mentions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={article.analytics.mentionsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="date" stroke="#000" style={{ fontSize: '12px' }} />
                <YAxis stroke="#000" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="mentions"
                  stroke="#000"
                  strokeWidth={2}
                  dot={{ fill: '#000', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Queries */}
      <Card>
        <CardHeader>
          <CardTitle>Top Queries Mentioning This Article</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {article.analytics.topQueries.map((query, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm">{query}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Article Content */}
      <Card>
        <CardHeader>
          <CardTitle>Article Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleDetail;
