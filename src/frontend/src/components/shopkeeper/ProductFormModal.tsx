import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAddProduct, useUpdateProduct } from '../../hooks/useQueries';
import { toast } from 'sonner';
import { Category, type Product } from '../../backend';
import { ExternalBlob } from '../../backend';
import { Upload } from 'lucide-react';

const categoryLabels: Record<string, string> = {
  grocery: 'Grocery',
  electronics: 'Electronics',
  fashion: 'Fashion',
  homeGarden: 'Home & Garden',
  healthBeauty: 'Health & Beauty',
  sportsOutdoors: 'Sports & Outdoors',
};

interface ProductFormModalProps {
  shopId: string;
  product?: Product;
  onClose: () => void;
}

export default function ProductFormModal({ shopId, product, onClose }: ProductFormModalProps) {
  const [name, setName] = useState(product?.name || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price.toString() || '');
  const [quantity, setQuantity] = useState(product?.quantity.toString() || '');
  const [category, setCategory] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();

  useEffect(() => {
    if (product) {
      const categoryKey = Object.keys(Category).find(
        (key) => Category[key as keyof typeof Category] === product.category
      );
      if (categoryKey) setCategory(categoryKey);
    }
  }, [product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !description.trim() || !price || !quantity || !category) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!product && !imageFile) {
      toast.error('Please select an image');
      return;
    }

    try {
      let imageBlob: ExternalBlob;

      if (imageFile) {
        const arrayBuffer = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageBlob = ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
          setUploadProgress(percentage);
        });
      } else if (product) {
        imageBlob = product.image;
      } else {
        toast.error('Image is required');
        return;
      }

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        quantity: BigInt(quantity),
        category: Category[category as keyof typeof Category],
        shopId,
        image: imageBlob,
      };

      if (product) {
        await updateProduct.mutateAsync({
          productId: product.id,
          product: productData,
        });
        toast.success('Product updated successfully!');
      } else {
        await addProduct.mutateAsync(productData);
        toast.success('Product added successfully!');
      }

      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    }
  };

  const isLoading = addProduct.isPending || updateProduct.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Stock Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="flex-1"
              />
              {product && !imageFile && (
                <img
                  src={product.image.getDirectURL()}
                  alt="Current"
                  className="w-16 h-16 object-cover rounded"
                />
              )}
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-success-green h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
