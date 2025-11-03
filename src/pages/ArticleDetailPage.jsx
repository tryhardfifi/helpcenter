import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockCompanyData } from '@/data/mockData';
import ArticleDetail from '@/components/articles/ArticleDetail';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const article = mockCompanyData.articles.find(a => a.id === id);

  if (!article) {
    return (
      <div className="space-y-6">
        <Link to="/articles">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Button>
        </Link>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Article not found</h2>
          <p className="text-muted-foreground mt-2">
            The article you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/articles">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Button>
      </Link>

      <ArticleDetail article={article} />
    </div>
  );
};

export default ArticleDetailPage;
