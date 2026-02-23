import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { useDeleteProduct } from '../../hooks/useQueries';
import { toast } from 'sonner';
import type { Product } from '../../backend';
import { Category } from '../../backend';
import ProductFormModal from './ProductFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

const categoryLabels: Record<string, string> = {
  grocery: 'Grocery',
  electronics: 'Electronics',
  fashion: 'Fashion',
  homeGarden: 'Home & Garden',
  healthBeauty: 'Health & Beauty',
  sportsOutdoors: 'Sports & Outdoors',
};

interface InventoryProductCardProps {
  product: Product;
}

export default function InventoryProductCard({ product }: InventoryProductCardProps) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const deleteProduct = useDeleteProduct();

  const categoryKey = Object.keys(Category).find(
    (key) => Category[key as keyof typeof Category] === product.category
  );
  const categoryLabel = categoryKey ? categoryLabels[categoryKey] : 'Unknown';

  const handleDelete = async () => {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Product deleted successfully');
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const inStock = Number(product.quantity) > 0;

  return (
    <>
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
            {!inStock && (
              <Badge className="absolute top-2 left-2 bg-destructive">
                Out of Stock
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-4">
          <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <span className="text-xl font-bold">₹{product.price.toFixed(2)}</span>
            <span className={`text-sm ${inStock ? 'text-success-green' : 'text-destructive'}`}>
              Stock: {product.quantity.toString()}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowEditModal(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </CardFooter>
      </Card>

      {showEditModal && (
        <ProductFormModal
          shopId={product.shopId}
          product={product}
          onClose={() => setShowEditModal(false)}
        />
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteProduct.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
