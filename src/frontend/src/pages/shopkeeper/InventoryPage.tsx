import { useState } from 'react';
import RoleGuard from '../../components/auth/RoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useGetProducts, useGetShops } from '../../hooks/useQueries';
import { Button } from '../../components/ui/button';
import { Package, Plus, AlertCircle } from 'lucide-react';
import InventoryProductCard from '../../components/shopkeeper/InventoryProductCard';
import ProductFormModal from '../../components/shopkeeper/ProductFormModal';

export default function InventoryPage() {
  const { userProfile } = useAuth();
  const { data: products = [] } = useGetProducts();
  const { data: shops = [] } = useGetShops();
  const [showAddModal, setShowAddModal] = useState(false);

  const myShop = shops.find((s) => s.id === userProfile?.shopId);
  const myProducts = products.filter((p) => p.shopId === userProfile?.shopId);

  if (!myShop) {
    return (
      <RoleGuard allowedRoles={['shopkeeper']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No shop registered</h3>
            <p className="text-muted-foreground">
              Please register your shop first from the Shop Dashboard
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  if (!myShop.approved) {
    return (
      <RoleGuard allowedRoles={['shopkeeper']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 max-w-md mx-auto">
              <AlertCircle className="h-16 w-16 text-yellow-600 dark:text-yellow-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Shop Pending Approval</h3>
              <p className="text-muted-foreground">
                Your shop is waiting for admin approval. Once approved, you'll be able to add and manage products. This page will update automatically.
              </p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['shopkeeper']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage your products and stock
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {myProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding products to your inventory
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {myProducts.map((product) => (
              <InventoryProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {showAddModal && (
          <ProductFormModal
            shopId={myShop.id}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </RoleGuard>
  );
}
