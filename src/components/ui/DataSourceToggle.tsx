import { useDataSourceStore } from '@/stores';
import { Database, HardDrive } from 'lucide-react';

const DataSourceToggle = () => {
  const useMockData = useDataSourceStore((state) => state.useMockData);
  const toggleDataSource = useDataSourceStore((state) => state.toggleDataSource);

  return (
    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
      <div className="flex items-center gap-2 text-xs">
        {useMockData ? (
          <HardDrive className="h-4 w-4" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        <span className="font-medium">
          {useMockData ? 'Mock Data' : 'Firestore'}
        </span>
      </div>
      <button
        onClick={() => {
          toggleDataSource(!useMockData);
          window.location.reload(); // Reload to fetch new data
        }}
        className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
      >
        Switch
      </button>
    </div>
  );
};

export default DataSourceToggle;
