import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useRequestReturn } from '../../hooks/useQueries';
import { toast } from 'sonner';

interface ReturnRequestModalProps {
  orderId: bigint;
  onClose: () => void;
}

const returnReasons = [
  { value: 'damaged', label: 'Damaged' },
  { value: 'wrong_item', label: 'Wrong Item' },
  { value: 'quality_issue', label: 'Quality Issue' },
  { value: 'changed_mind', label: 'Changed Mind' },
];

export default function ReturnRequestModal({ orderId, onClose }: ReturnRequestModalProps) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const requestReturn = useRequestReturn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    const selectedReason = returnReasons.find((r) => r.value === reason);
    const fullReason = description
      ? `${selectedReason?.label}: ${description}`
      : selectedReason?.label || reason;

    try {
      await requestReturn.mutateAsync({ orderId, reason: fullReason });
      toast.success('Return request submitted successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to submit return request');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Return/Exchange</DialogTitle>
          <DialogDescription>
            Order #{orderId.toString()}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {returnReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about your request..."
              rows={4}
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={requestReturn.isPending} className="flex-1">
              {requestReturn.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
