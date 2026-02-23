import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { ShoppingCart } from 'lucide-react';
import { useGetCart, useGetProducts } from '../../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Badge } from '../ui/badge';
import CartItem from './CartItem';

export default function CartSidebar() {
  const [open, setOpen] = useState(false);
  const { data: cart = [] } = useGetCart();
  const { data: products = [] } = useGetProducts();
  const navigate = useNavigate();

  const cartItemsWithDetails = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return { ...item, product };
  });

  const total = cartItemsWithDetails.reduce((sum, item) => {
    if (item.product) {
      return sum + item.product.price * Number(item.quantity);
    }
    return sum;
  }, 0);

  const handleCheckout = () => {
    setOpen(false);
    navigate({ to: '/checkout' });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="icon"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-success-green hover:bg-success-green-dark z-40"
        >
          <ShoppingCart className="h-6 w-6" />
          {cart.length > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-destructive">
              {cart.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full pt-6">
          {cart.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                {cartItemsWithDetails.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
