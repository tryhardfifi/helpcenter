import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

const ArticleCard = ({ article }) => {
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

  return (
    <Link to={`/articles/${article.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium line-clamp-2">
              {article.title}
            </CardTitle>
            <Badge variant={getImpactVariant(article.impact)} className="shrink-0 capitalize">
              {article.impact}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <a
            href={`https://${article.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            {article.url}
            <ExternalLink className="h-3 w-3" />
          </a>

          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Mentions:</span>
              <span className="font-semibold ml-2">{article.mentions}</span>
            </div>
            <div className="text-muted-foreground">
              {new Date(article.publishDate).toLocaleDateString()}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {article.topics.map((topic, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ArticleCard;
