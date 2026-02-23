import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useAuth } from './hooks/useAuth';
import AppLayout from './components/layout/AppLayout';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import HomePage from './pages/HomePage';
import ShopBrowsePage from './pages/customer/ShopBrowsePage';
import ProductBrowsePage from './pages/customer/ProductBrowsePage';
import CheckoutPage from './pages/customer/CheckoutPage';
import MyOrdersPage from './pages/customer/MyOrdersPage';
import ReturnRequestsPage from './pages/customer/ReturnRequestsPage';
import MyTicketsPage from './pages/customer/MyTicketsPage';
import ShopDashboardPage from './pages/shopkeeper/ShopDashboardPage';
import InventoryPage from './pages/shopkeeper/InventoryPage';
import OrdersPage from './pages/shopkeeper/OrdersPage';
import LedgerPage from './pages/shopkeeper/LedgerPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ShopManagementPage from './pages/admin/ShopManagementPage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import TicketsPage from './pages/admin/TicketsPage';
import SettingsPage from './pages/admin/SettingsPage';
import { Toaster } from './components/ui/sonner';

function RootLayout() {
  const { isInitializing } = useInternetIdentity();
  const { userProfile, profileLoading, isFetched, isAuthenticated } = useAuth();

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const shopBrowseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shops',
  component: ShopBrowsePage,
});

const productBrowseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductBrowsePage,
});

const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/checkout',
  component: CheckoutPage,
});

const myOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-orders',
  component: MyOrdersPage,
});

const returnRequestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/return-requests',
  component: ReturnRequestsPage,
});

const myTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/my-tickets',
  component: MyTicketsPage,
});

const shopDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper',
  component: ShopDashboardPage,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper/inventory',
  component: InventoryPage,
});

const shopOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper/orders',
  component: OrdersPage,
});

const ledgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/shopkeeper/ledger',
  component: LedgerPage,
});

const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const shopManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/shops',
  component: ShopManagementPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/analytics',
  component: AnalyticsPage,
});

const ticketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/tickets',
  component: TicketsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopBrowseRoute,
  productBrowseRoute,
  checkoutRoute,
  myOrdersRoute,
  returnRequestsRoute,
  myTicketsRoute,
  shopDashboardRoute,
  inventoryRoute,
  shopOrdersRoute,
  ledgerRoute,
  adminDashboardRoute,
  shopManagementRoute,
  analyticsRoute,
  ticketsRoute,
  settingsRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
