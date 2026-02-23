import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useUpdateOrderStatus } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Order } from '../../backend';
import { OrderStatus } from '../../backend';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-success-green',
  cancelled: 'bg-destructive',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  shipped: 'Preparing',
  delivered: 'Completed',
  cancelled: 'Cancelled',
};

interface ShopOrderCardProps {
  order: Order;
}

export default function ShopOrderCard({ order }: ShopOrderCardProps) {
  const updateStatus = useUpdateOrderStatus();

  const statusKey = Object.keys(OrderStatus).find(
    (key) => OrderStatus[key as keyof typeof OrderStatus] === order.status
  );
  const statusLabel = statusKey ? statusLabels[statusKey] : 'Unknown';
  const statusColor = statusKey ? statusColors[statusKey] : 'bg-gray-500';

  const date = new Date(Number(order.timestamp) / 1000000);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ orderId: order.id, status: newStatus });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getNextActions = () => {
    if (statusKey === 'pending') {
      return [
        { label: 'Confirm', status: OrderStatus.confirmed },
        { label: 'Cancel', status: OrderStatus.cancelled, variant: 'destructive' as const },
      ];
    }
    if (statusKey === 'confirmed') {
      return [{ label: 'Start Preparing', status: OrderStatus.shipped }];
    }
    if (statusKey === 'shipped') {
      return [{ label: 'Mark Ready', status: OrderStatus.delivered }];
    }
    return [];
  };

  const actions = getNextActions();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">Order #{order.id.toString()}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {date.toLocaleDateString()} at {date.toLocaleTimeString()}
            </p>
          </div>
          <Badge className={statusColor}>{statusLabel}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Total Amount</span>
              <p className="text-lg font-bold">₹{order.total.toFixed(2)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Items</span>
              <p className="text-lg font-bold">{order.items.length}</p>
            </div>
          </div>

          {actions.length > 0 && (
            <div className="flex gap-2 pt-2">
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  variant={action.variant || 'default'}
                  size="sm"
                  onClick={() => handleStatusUpdate(action.status)}
                  disabled={updateStatus.isPending}
                  className="flex-1"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
