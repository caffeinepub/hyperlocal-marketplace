import RoleGuard from '../../components/auth/RoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useGetShopOrders } from '../../hooks/useQueries';
import { Package } from 'lucide-react';
import ShopOrderCard from '../../components/shopkeeper/ShopOrderCard';

export default function OrdersPage() {
  const { userProfile } = useAuth();
  const { data: orders = [], isLoading } = useGetShopOrders(userProfile?.shopId || null);

  const sortedOrders = [...orders].sort((a, b) => Number(b.timestamp - a.timestamp));

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
