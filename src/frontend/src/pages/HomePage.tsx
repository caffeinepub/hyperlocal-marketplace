import { useAuth } from '../hooks/useAuth';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '../components/ui/button';
import { ShoppingBag, Store, Shield, MapPin, Package, TrendingUp } from 'lucide-react';
import { AppRole } from '../backend';

export default function HomePage() {
  const { isAuthenticated, userProfile } = useAuth();
  const navigate = useNavigate();

  const userRoleKey = userProfile
    ? (Object.keys(AppRole).find(
        (key) => AppRole[key as keyof typeof AppRole] === userProfile.appRole
      ) as 'customer' | 'shopkeeper' | 'admin' | undefined)
    : undefined;

  const handleGetStarted = () => {
    if (!isAuthenticated) return;

    if (userRoleKey === 'customer') {
      navigate({ to: '/shops' });
    } else if (userRoleKey === 'shopkeeper') {
      navigate({ to: '/shopkeeper' });
    } else if (userRoleKey === 'admin') {
      navigate({ to: '/admin' });
    }
  };

  return (
    <div className="w-full">
      <section
        className="relative bg-gradient-to-br from-trust-blue to-trust-blue-dark text-white py-20 md:py-32"
        style={{
          backgroundImage: 'url(/assets/generated/hero-banner.dim_1200x400.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-trust-blue/80"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Your Local Marketplace
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Connect with local shops, discover products, and support your community
            </p>
            {isAuthenticated && userProfile ? (
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="bg-success-green hover:bg-success-green-dark text-white text-lg px-8 py-6"
              >
                Go to Dashboard
              </Button>
            ) : (
              <p className="text-lg text-white/80">
                Please log in to get started
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Three Portals, One Platform
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-8 shadow-sm border text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-trust-blue/10 rounded-full flex items-center justify-center">
                <img
                  src="/assets/generated/customer-icon.dim_64x64.png"
                  alt="Customer"
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-xl font-bold mb-3">Customer Portal</h3>
              <p className="text-muted-foreground mb-4">
                Browse local shops, discover products by category, and place orders with ease
              </p>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-trust-blue flex-shrink-0" />
                  <span>Filter shops by location</span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="h-4 w-4 mt-0.5 text-trust-blue flex-shrink-0" />
                  <span>Track your orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <ShoppingBag className="h-4 w-4 mt-0.5 text-trust-blue flex-shrink-0" />
                  <span>Quick-add cart system</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-sm border text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-success-green/10 rounded-full flex items-center justify-center">
                <img
                  src="/assets/generated/shopkeeper-icon.dim_64x64.png"
                  alt="Shopkeeper"
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-xl font-bold mb-3">Shopkeeper Portal</h3>
              <p className="text-muted-foreground mb-4">
                Manage your inventory, process orders, and track your earnings
              </p>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Store className="h-4 w-4 mt-0.5 text-success-green flex-shrink-0" />
                  <span>Online/offline toggle</span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="h-4 w-4 mt-0.5 text-success-green flex-shrink-0" />
                  <span>Inventory management</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-success-green flex-shrink-0" />
                  <span>Digital ledger with commission tracking</span>
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-8 shadow-sm border text-center hover:shadow-md transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <img
                  src="/assets/generated/admin-icon.dim_64x64.png"
                  alt="Admin"
                  className="w-10 h-10"
                />
              </div>
              <h3 className="text-xl font-bold mb-3">Admin Dashboard</h3>
              <p className="text-muted-foreground mb-4">
                Oversee platform operations, approve shops, and manage support
              </p>
              <ul className="text-sm text-left space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Shield className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
                  <span>Shop approval system</span>
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
                  <span>Transaction analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="h-4 w-4 mt-0.5 text-destructive flex-shrink-0" />
                  <span>Support ticket management</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Local Market Hub today and be part of a thriving local commerce community
          </p>
          {!isAuthenticated && (
            <p className="text-muted-foreground">
              Click the Login button in the header to begin
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
