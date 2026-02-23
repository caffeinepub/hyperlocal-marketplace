import RoleGuard from '../../components/auth/RoleGuard';
import { useGetShops, useApproveShop } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Store, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ShopManagementPage() {
  const { data: shops = [], isLoading } = useGetShops();
  const approveShop = useApproveShop();

  const pendingShops = shops.filter((s) => !s.approved);
  const approvedShops = shops.filter((s) => s.approved);

  const handleApprove = async (shopId: string) => {
    try {
      await approveShop.mutateAsync(shopId);
      toast.success('Shop approved successfully!');
    } catch (error) {
      toast.error('Failed to approve shop');
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading shops...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shop Management</h1>
          <p className="text-muted-foreground">
            Approve and manage shops on the platform
          </p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Approval ({pendingShops.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved ({approvedShops.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-6">
            {pendingShops.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No pending approvals</h3>
                <p className="text-muted-foreground">
                  All shops have been reviewed
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {pendingShops.map((shop) => (
                  <Card key={shop.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-yellow-600 dark:text-yellow-500" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{shop.name}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{shop.location}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20">
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        className="w-full"
                        onClick={() => handleApprove(shop.id)}
                        disabled={approveShop.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approveShop.isPending ? 'Approving...' : 'Approve Shop'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            {approvedShops.length === 0 ? (
              <div className="text-center py-12">
                <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No approved shops</h3>
                <p className="text-muted-foreground">
                  Approved shops will appear here
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedShops.map((shop) => (
                  <Card key={shop.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-success-green/10 rounded-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-success-green" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{shop.name}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>{shop.location}</span>
                            </div>
                          </div>
                        </div>
                        {shop.isOpen && (
                          <Badge className="bg-success-green">Online</Badge>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
