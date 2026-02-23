import { useState, useMemo } from 'react';
import RoleGuard from '../../components/auth/RoleGuard';
import { useGetProducts } from '../../hooks/useQueries';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import ProductCard from '../../components/customer/ProductCard';
import { Package } from 'lucide-react';
import { Category } from '../../backend';

const categoryLabels: Record<string, string> = {
  grocery: 'Grocery',
  electronics: 'Electronics',
  fashion: 'Fashion',
  homeGarden: 'Home & Garden',
  healthBeauty: 'Health & Beauty',
  sportsOutdoors: 'Sports & Outdoors',
};

export default function ProductBrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { data: allProducts = [], isLoading } = useGetProducts();

  const products = useMemo(() => {
    if (selectedCategory === 'all') return allProducts;
    return allProducts.filter((p) => {
      const categoryKey = Object.keys(Category).find(
        (key) => Category[key as keyof typeof Category] === p.category
      );
      return categoryKey === selectedCategory;
    });
  }, [allProducts, selectedCategory]);

  const availableProducts = products.filter((p) => Number(p.quantity) > 0);

  return (
    <RoleGuard allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Products</h1>
          <p className="text-muted-foreground">
            Discover products from local shops
          </p>
        </div>

        <div className="mb-8 max-w-xs">
          <Label htmlFor="category">Filter by Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : availableProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {selectedCategory === 'all'
                ? 'No products available at the moment.'
                : `No products found in ${categoryLabels[selectedCategory]}.`}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
