import { useState } from 'react';
import RoleGuard from '../../components/auth/RoleGuard';
import { useGetShops, useGetShopsByLocation } from '../../hooks/useQueries';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import ShopCard from '../../components/customer/ShopCard';
import { Search, MapPin } from 'lucide-react';

export default function ShopBrowsePage() {
  const [location, setLocation] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const { data: allShops = [] } = useGetShops();
  const { data: filteredShops = [] } = useGetShopsByLocation(searchLocation);

  const shops = searchLocation ? filteredShops : allShops;
  const onlineShops = shops.filter((shop) => shop.isOpen && shop.approved);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchLocation(location.trim());
  };

  return (
    <RoleGuard allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Local Shops</h1>
          <p className="text-muted-foreground">
            Discover shops in your area and start shopping
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-8 max-w-2xl">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="location" className="sr-only">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter city or area (e.g., Mumbai, Delhi)"
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          {searchLocation && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing shops in: <strong>{searchLocation}</strong>
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchLocation('');
                  setLocation('');
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </form>

        {onlineShops.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No shops found</h3>
            <p className="text-muted-foreground">
              {searchLocation
                ? `No online shops found in ${searchLocation}. Try a different location.`
                : 'No online shops available at the moment.'}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {onlineShops.map((shop) => (
              <ShopCard key={shop.id} shop={shop} />
            ))}
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
