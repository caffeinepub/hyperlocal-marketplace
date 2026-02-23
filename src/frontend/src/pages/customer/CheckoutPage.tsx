import RoleGuard from '../../components/auth/RoleGuard';
import { useGetCart, useGetProducts, useCheckout } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const { data: cart = [] } = useGetCart();
  const { data: products = [] } = useGetProducts();
  const checkout = useCheckout();
  const navigate = useNavigate();

  const cartItemsWithDetails = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const subtotal = cartItemsWithDetails.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * Number(item.quantity);
    }
    return sum;
  }, 0);

  const commission = subtotal * 0.02;
  const total = subtotal + commission;

  const handleCheckout = async () => {
    try {
      const orderId = await checkout.mutateAsync();
      toast.success('Order placed successfully!');
      navigate({ to: '/my-orders' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  if (cart.length === 0) {
    return (
      <RoleGuard allowedRoles={['customer']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-6">
              Add some products to your cart before checking out
            </p>
            <Button onClick={() => navigate({ to: '/products' })}>
              Browse Products
            </Button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItemsWithDetails.map((item) => {
                  if (!item.product) return null;
                  return (
                    <div key={item.productId} className="flex gap-4">
                      <img
                        src={item.product.image.getDirectURL()}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity.toString()}
                        </p>
                        <p className="text-sm font-medium mt-1">
                          ₹{item.product.price} × {item.quantity.toString()} = ₹
                          {(item.product.price * Number(item.quantity)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee (2%)</span>
                    <span>₹{commission.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={checkout.isPending}
                >
                  {checkout.isPending ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
