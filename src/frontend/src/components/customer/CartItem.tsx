import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useUpdateCartItem } from '../../hooks/useQueries';
import type { CartItem as CartItemType, Product } from '../../backend';
import { toast } from 'sonner';

interface CartItemProps {
  item: CartItemType & { product?: Product };
}

export default function CartItem({ item }: CartItemProps) {
  const updateCart = useUpdateCartItem();

  if (!item.product) return null;

  const handleUpdateQuantity = async (newQuantity: bigint) => {
    try {
      await updateCart.mutateAsync({
        productId: item.productId,
        quantity: newQuantity,
      });
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemove = () => handleUpdateQuantity(BigInt(0));
  const handleIncrement = () => handleUpdateQuantity(item.quantity + BigInt(1));
  const handleDecrement = () => {
    if (item.quantity > BigInt(1)) {
      handleUpdateQuantity(item.quantity - BigInt(1));
    }
  };

  const subtotal = item.product.price * Number(item.quantity);

  return (
    <div className="flex gap-4 p-4 border rounded-lg">
      <img
        src={item.product.image.getDirectURL()}
        alt={item.product.name}
        className="w-20 h-20 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{item.product.name}</h4>
        <p className="text-sm text-muted-foreground">₹{item.product.price}</p>
        <div className="flex items-center gap-2 mt-2">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={handleDecrement}
            disabled={updateCart.isPending}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="text-sm font-medium w-8 text-center">
            {item.quantity.toString()}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7"
            onClick={handleIncrement}
            disabled={updateCart.isPending}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 ml-auto text-destructive"
            onClick={handleRemove}
            disabled={updateCart.isPending}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <div className="text-right">
        <p className="font-medium">₹{subtotal.toFixed(2)}</p>
      </div>
    </div>
  );
}
