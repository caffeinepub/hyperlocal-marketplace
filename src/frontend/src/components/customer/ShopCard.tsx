import { Store, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useNavigate } from '@tanstack/react-router';
import type { Shop } from '../../backend';

interface ShopCardProps {
  shop: Shop;
}

export default function ShopCard({ shop }: ShopCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-trust-blue/10 rounded-full flex items-center justify-center">
              <Store className="h-6 w-6 text-trust-blue" />
            </div>
            <div>
              <CardTitle className="text-lg">{shop.name}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3 w-3" />
                <span>{shop.location}</span>
              </div>
            </div>
          </div>
          {shop.isOpen && (
            <Badge className="bg-success-green">Online</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          onClick={() => navigate({ to: '/products', search: { shopId: shop.id } })}
        >
          View Products
        </Button>
      </CardContent>
    </Card>
  );
}
