import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCompanyData } from '@/contexts/CompanyDataContext';
import { useCompanyId } from '@/hooks/useCompanyId';
import { getDataSource, createPrompt, deletePrompt } from '@/services/dataService';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Database, Plus, Trash2 } from 'lucide-react';

const Prompts = () => {
  const { prompts, loading, refetch } = useCompanyData();
  const { companyId } = useCompanyId();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [promptToDelete, setPromptToDelete] = useState(null);

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

  const handleDeleteClick = (prompt, e) => {
    e.stopPropagation();
    setPromptToDelete(prompt);
  };

  const handleConfirmDelete = async () => {
    if (!promptToDelete) return;

    setDeleting(promptToDelete.id);
    try {
      await deletePrompt(companyId, promptToDelete.id);
      await refetch();
      setPromptToDelete(null);
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Failed to delete prompt');
    } finally {
      setDeleting(null);
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
            Track how your business is mentioned across prompts
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
          Track how your business is mentioned across prompts
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
                <TableHead className="text-right">Mentioned</TableHead>
                <TableHead className="text-right">Avg. Position</TableHead>
                <TableHead className="text-right">Last Updated</TableHead>
                <TableHead className="w-[100px]"></TableHead>
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
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex items-end">
                        <svg width="16" height="14" viewBox="0 0 45 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 absolute ml-[-3px] mb-[-5px]">
                          <path d="M0 31C14 24 19.1667 10.6667 19 2.5V0H44.5V1.5C37.7 23.1 17.5 31.5 0 31Z" fill="#E9E9EB"/>
                        </svg>
                        <div className="bg-[#E9E9EB] text-gray-800 px-3 py-2 rounded-2xl">
                          {prompt.text}
                        </div>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <div>{prompt.mentionRate}%</div>
                    <div className="text-xs text-muted-foreground font-normal">
                      {Math.round(prompt.mentionRate / 10)} out of 10 times
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{prompt.analytics.averagePosition}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {formatRelativeTime(prompt.lastUpdated)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteClick(prompt, e)}
                      disabled={deleting === prompt.id}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!promptToDelete} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{promptToDelete?.text}"? This action cannot be undone and will remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPromptToDelete(null)} disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Prompts;
