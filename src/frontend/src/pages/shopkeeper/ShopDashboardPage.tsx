import { useState } from 'react';
import RoleGuard from '../../components/auth/RoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useGetShops, useRegisterShop, useToggleShopStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Store, MapPin, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopDashboardPage() {
  const { userProfile } = useAuth();
  const { data: shops = [] } = useGetShops();
  const registerShop = useRegisterShop();
  const toggleStatus = useToggleShopStatus();

  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState('');

  const myShop = shops.find((s) => s.id === userProfile?.shopId);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !location.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await registerShop.mutateAsync({ name: shopName.trim(), location: location.trim() });
      toast.success('Shop registered! Waiting for admin approval.');
      setShopName('');
      setLocation('');
    } catch (error) {
      toast.error('Failed to register shop');
    }
  };

  const handleToggleStatus = async () => {
    if (!myShop) return;
    try {
      await toggleStatus.mutateAsync(myShop.id);
      toast.success(`Shop is now ${myShop.isOpen ? 'offline' : 'online'}`);
    } catch (error) {
      toast.error('Failed to update shop status');
    }
  };

  return (
    <RoleGuard allowedRoles={['shopkeeper']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Shop Dashboard</h1>

        {!myShop ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Register Your Shop</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="shopName">Shop Name</Label>
                  <Input
                    id="shopName"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="Enter your shop name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City or area (e.g., Mumbai, Delhi)"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={registerShop.isPending}>
                  {registerShop.isPending ? 'Registering...' : 'Register Shop'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {!myShop.approved && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
                    Pending Approval
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    Your shop is waiting for admin approval. You'll be able to add products once approved.
                  </p>
                </div>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Shop Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-trust-blue/10 rounded-full flex items-center justify-center">
                    <Store className="h-6 w-6 text-trust-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{myShop.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{myShop.location}</span>
                    </div>
                  </div>
                </div>

                {myShop.approved && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div>
                      <Label htmlFor="shop-status" className="text-base">
                        Shop Status
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {myShop.isOpen ? 'Your shop is visible to customers' : 'Your shop is hidden from customers'}
                      </p>
                    </div>
                    <Switch
                      id="shop-status"
                      checked={myShop.isOpen}
                      onCheckedChange={handleToggleStatus}
                      disabled={toggleStatus.isPending}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
