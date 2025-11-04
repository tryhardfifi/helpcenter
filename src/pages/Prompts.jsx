import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { useCompanyId } from '@/hooks/useCompanyId';
import { getDataSource, createPrompt } from '@/services/dataService';
import { formatRelativeTime } from '@/utils/dateUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Database, Plus } from 'lucide-react';

const Prompts = () => {
  const { prompts, loading, refetch } = useCompanyData();
  const { companyId } = useCompanyId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreatePrompt = async () => {
    if (!promptText.trim()) return;

    setCreating(true);
    try {
      await createPrompt(companyId, promptText.trim());
      await refetch();
      setIsDialogOpen(false);
      setPromptText('');
    } catch (error) {
      console.error('Error creating prompt:', error);
      alert('Failed to create prompt');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    const isFirestoreMode = !getDataSource();

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground mt-1">
            Track AI mentions across different prompts
          </p>
        </div>

        {isFirestoreMode && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Database className="h-5 w-5" />
                Firestore Data Not Found
              </CardTitle>
            </CardHeader>
            <CardContent className="text-orange-900">
              <p className="mb-3">
                You're using Firestore mode, but no data has been seeded yet.
              </p>
              <div className="bg-white/50 p-3 rounded border border-orange-200">
                <p className="font-semibold mb-2">To seed demo data, run:</p>
                <code className="block bg-orange-100 px-3 py-2 rounded text-sm font-mono">
                  npm run seed
                </code>
                <p className="text-sm mt-2 text-muted-foreground">
                  Or with a custom email: <code className="bg-orange-100 px-1 rounded">npm run seed your@email.com</code>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {!isFirestoreMode && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No prompts available</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Prompts</h1>
          <p className="text-muted-foreground mt-1">
            Track AI mentions across different prompts
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Prompt
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prompt</TableHead>
                <TableHead className="text-right">Mention Rate</TableHead>
                <TableHead className="text-right">Avg Position</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow
                  key={prompt.id}
                  className="cursor-pointer hover:bg-secondary/50"
                  onClick={() => window.location.href = `/prompts/${prompt.id}`}
                >
                  <TableCell className="font-medium max-w-md">
                    <Link
                      to={`/prompts/${prompt.id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {prompt.text}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">{prompt.mentionRate}%</TableCell>
                  <TableCell className="text-right">#{prompt.analytics.averagePosition}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatRelativeTime(prompt.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Prompt Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Add a new prompt to track across AI answer engines
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="prompt-text">Prompt Text</Label>
              <Input
                id="prompt-text"
                placeholder="e.g., What are the best project management tools?"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !creating) {
                    handleCreatePrompt();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setPromptText('');
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePrompt}
              disabled={!promptText.trim() || creating}
            >
              {creating ? 'Creating...' : 'Create Prompt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prompts;
