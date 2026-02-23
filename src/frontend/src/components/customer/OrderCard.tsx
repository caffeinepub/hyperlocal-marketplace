import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Order } from '../../backend';
import { OrderStatus } from '../../backend';
import ReturnRequestModal from './ReturnRequestModal';

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

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const statusKey = Object.keys(OrderStatus).find(
    (key) => OrderStatus[key as keyof typeof OrderStatus] === order.status
  );
  const statusLabel = statusKey ? statusLabels[statusKey] : 'Unknown';
  const statusColor = statusKey ? statusColors[statusKey] : 'bg-gray-500';

  const date = new Date(Number(order.timestamp) / 1000000);
  const canRequestReturn = statusKey === 'delivered';

  return (
    <>
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
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Amount:</span>
              <span className="font-bold text-lg">₹{order.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Items:</span>
              <span>{order.items.length} item(s)</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="flex-1"
              >
                {expanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    View Details
                  </>
                )}
              </Button>
              {canRequestReturn && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReturnModal(true)}
                >
                  Request Return
                </Button>
              )}
            </div>
            {expanded && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <h4 className="font-medium mb-2">Order Items:</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-sm flex justify-between">
                    <span className="text-muted-foreground">
                      Product ID: {item.productId}
                    </span>
                    <span>Qty: {item.quantity.toString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {showReturnModal && (
        <ReturnRequestModal
          orderId={order.id}
          onClose={() => setShowReturnModal(false)}
        />
      )}
    </>
  );
}
