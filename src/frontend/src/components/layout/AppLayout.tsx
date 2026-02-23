import { ReactNode, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link, useNavigate } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';
import { Menu, X, ShoppingBag, Store, Shield } from 'lucide-react';
import { Button } from '../ui/button';
import { AppRole } from '../../backend';
import CartSidebar from '../customer/CartSidebar';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated, userProfile } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const userRoleKey = userProfile
    ? (Object.keys(AppRole).find(
        (key) => AppRole[key as keyof typeof AppRole] === userProfile.appRole
      ) as 'customer' | 'shopkeeper' | 'admin' | undefined)
    : undefined;

  const isCustomer = userRoleKey === 'customer';
  const isShopkeeper = userRoleKey === 'shopkeeper';
  const isAdmin = userRoleKey === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-trust-blue text-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                <ShoppingBag className="h-6 w-6" />
                <span className="hidden sm:inline">Local Market Hub</span>
                <span className="sm:hidden">LMH</span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              {isAuthenticated && userProfile && (
                <>
                  {isCustomer && (
                    <>
                      <Link
                        to="/shops"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Browse Shops
                      </Link>
                      <Link
                        to="/products"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Products
                      </Link>
                      <Link
                        to="/my-orders"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        My Orders
                      </Link>
                    </>
                  )}
                  {isShopkeeper && (
                    <>
                      <Link
                        to="/shopkeeper"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/shopkeeper/inventory"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Inventory
                      </Link>
                      <Link
                        to="/shopkeeper/orders"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Orders
                      </Link>
                      <Link
                        to="/shopkeeper/ledger"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Ledger
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/shops"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Shops
                      </Link>
                      <Link
                        to="/admin/analytics"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Analytics
                      </Link>
                      <Link
                        to="/admin/tickets"
                        className="text-sm font-medium hover:text-success-green transition-colors"
                      >
                        Tickets
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              {isAuthenticated && userProfile && (
                <span className="hidden sm:inline text-sm">
                  Hi, {userProfile.name}
                </span>
              )}
              <LoginButton />
              <button
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
              {isAuthenticated && userProfile && (
                <>
                  {isCustomer && (
                    <>
                      <Link
                        to="/shops"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Browse Shops
                      </Link>
                      <Link
                        to="/products"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Products
                      </Link>
                      <Link
                        to="/my-orders"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                    </>
                  )}
                  {isShopkeeper && (
                    <>
                      <Link
                        to="/shopkeeper"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/shopkeeper/inventory"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Inventory
                      </Link>
                      <Link
                        to="/shopkeeper/orders"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <Link
                        to="/shopkeeper/ledger"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Ledger
                      </Link>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/shops"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Shops
                      </Link>
                      <Link
                        to="/admin/analytics"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Analytics
                      </Link>
                      <Link
                        to="/admin/tickets"
                        className="text-sm font-medium hover:text-success-green transition-colors py-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Tickets
                      </Link>
                    </>
                  )}
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      {isCustomer && <CartSidebar />}

      <footer className="border-t bg-muted/30 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Local Market Hub. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== 'undefined' ? window.location.hostname : 'local-market-hub'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-trust-blue hover:underline"
              >
                caffeine.ai
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
