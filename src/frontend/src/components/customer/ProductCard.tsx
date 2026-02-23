import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useAddToCart } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Product } from '../../backend';
import { Category } from '../../backend';

const categoryLabels: Record<string, string> = {
  grocery: 'Grocery',
  electronics: 'Electronics',
  fashion: 'Fashion',
  homeGarden: 'Home & Garden',
  healthBeauty: 'Health & Beauty',
  sportsOutdoors: 'Sports & Outdoors',
};

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddToCart();

  const categoryKey = Object.keys(Category).find(
    (key) => Category[key as keyof typeof Category] === product.category
  );
  const categoryLabel = categoryKey ? categoryLabels[categoryKey] : 'Unknown';

  const handleAddToCart = async () => {
    try {
      await addToCart.mutateAsync({
        productId: product.id,
        quantity: BigInt(1),
      });
      toast.success('Added to cart!');
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const inStock = Number(product.quantity) > 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <img
            src={product.image.getDirectURL()}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <Badge className="absolute top-2 right-2 bg-trust-blue">
            {categoryLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {product.description}
        </p>
        <div className="flex items-center justify-between mt-auto">
          <span className="text-2xl font-bold text-trust-blue">
            ₹{product.price.toFixed(2)}
          </span>
          {inStock ? (
            <span className="text-xs text-success-green">
              {product.quantity.toString()} in stock
            </span>
          ) : (
            <span className="text-xs text-destructive">Out of stock</span>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!inStock || addToCart.isPending}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {addToCart.isPending ? 'Adding...' : 'Quick Add'}
        </Button>
      </CardFooter>
    </Card>
  );
}
