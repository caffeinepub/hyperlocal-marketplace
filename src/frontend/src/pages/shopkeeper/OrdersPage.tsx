import RoleGuard from '../../components/auth/RoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useGetShopOrders, useGetShops } from '../../hooks/useQueries';
import { Package, AlertCircle } from 'lucide-react';
import ShopOrderCard from '../../components/shopkeeper/ShopOrderCard';

export default function OrdersPage() {
  const { userProfile } = useAuth();
  const { data: shops = [] } = useGetShops();
  const { data: orders = [], isLoading } = useGetShopOrders(userProfile?.shopId || null);

  const myShop = shops.find((s) => s.id === userProfile?.shopId);
  const sortedOrders = [...orders].sort((a, b) => Number(b.timestamp - a.timestamp));

  if (!myShop) {
    return (
      <RoleGuard allowedRoles={['shopkeeper']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No shop registered</h3>
            <p className="text-muted-foreground">
              Please register your shop first from the Shop Dashboard
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!myShop.approved) {
    return (
      <RoleGuard allowedRoles={['shopkeeper']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-yellow-600 dark:text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Shop Pending Approval</h3>
              <p className="text-muted-foreground">
                Your shop is waiting for admin approval. Once approved, you'll be able to view and manage orders. This page will update automatically.
              </p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['shopkeeper']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Orders</h1>
          <p className="text-muted-foreground">
            Manage incoming orders from customers
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              Orders from customers will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <ShopOrderCard key={order.id.toString()} order={order} />
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
