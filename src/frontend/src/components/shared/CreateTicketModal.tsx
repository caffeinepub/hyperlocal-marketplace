import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useCreateSupportTicket } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface CreateTicketModalProps {
  onClose: () => void;
}

export default function CreateTicketModal({ onClose }: CreateTicketModalProps) {
  const [issue, setIssue] = useState('');
  const createTicket = useCreateSupportTicket();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) {
      toast.error('Please describe your issue');
      return;
    }

    try {
      await createTicket.mutateAsync(issue.trim());
      toast.success('Support ticket created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issue">Describe your issue</Label>
            <Textarea
              id="issue"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              placeholder="Please provide details about your issue..."
              rows={6}
              required
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={createTicket.isPending} className="flex-1">
              {createTicket.isPending ? 'Creating...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
