import RoleGuard from '../../components/auth/RoleGuard';
import { useGetMyOrders } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import OrderCard from '../../components/customer/OrderCard';
import { Package, RefreshCw } from 'lucide-react';

export default function MyOrdersPage() {
  const { data: orders = [], isLoading, refetch } = useGetMyOrders();

  const sortedOrders = [...orders].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <RoleGuard allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Orders</h1>
            <p className="text-muted-foreground">
              Track and manage your orders
            </p>
          </div>
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
              Start shopping to see your orders here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => (
              <OrderCard key={order.id.toString()} order={order} />
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
