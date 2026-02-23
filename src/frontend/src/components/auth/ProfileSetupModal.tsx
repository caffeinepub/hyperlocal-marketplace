import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useSaveUserProfile } from '../../hooks/useQueries';
import { AppRole } from '../../backend';
import { toast } from 'sonner';

export default function ProfileSetupModal() {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'customer' | 'shopkeeper' | 'admin'>('customer');
  const saveProfile = useSaveUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        appRole: AppRole[role],
        location: undefined,
        shopId: undefined,
      });
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error('Failed to create profile');
      console.error(error);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Welcome to Local Market Hub</DialogTitle>
          <DialogDescription>
            Let's set up your profile to get started
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-3">
            <Label>I am a...</Label>
            <RadioGroup value={role} onValueChange={(v) => setRole(v as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="customer" id="customer" />
                <Label htmlFor="customer" className="font-normal cursor-pointer">
                  Customer - Browse and shop from local stores
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shopkeeper" id="shopkeeper" />
                <Label htmlFor="shopkeeper" className="font-normal cursor-pointer">
                  Shopkeeper - Manage my store and inventory
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin" className="font-normal cursor-pointer">
                  Admin - Platform management
                </Label>
              </div>
            </RadioGroup>
          </div>
          <Button type="submit" className="w-full" disabled={saveProfile.isPending}>
            {saveProfile.isPending ? 'Creating Profile...' : 'Get Started'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
