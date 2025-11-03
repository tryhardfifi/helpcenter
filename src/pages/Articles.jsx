import { mockCompanyData } from '@/data/mockData';
import ArticleList from '@/components/articles/ArticleList';

const Articles = () => {
  const articles = mockCompanyData.articles;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Articles</h1>
        <p className="text-muted-foreground mt-1">
          Your published content and its AI mention impact
        </p>
      </div>

      <ArticleList articles={articles} />
    </div>
  );
};

export default Articles;
