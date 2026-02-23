import RoleGuard from '../../components/auth/RoleGuard';
import { useGetPlatformStats } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { TrendingUp } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useGetPlatformStats();

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Transaction Analytics</h1>
          <p className="text-muted-foreground">
            Monitor platform sales and commission tracking
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Platform Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats?.totalSales.toFixed(2) || '0.00'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Commission Collected (2%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success-green">
                ₹{stats?.totalCommissions.toFixed(2) || '0.00'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders.toString() || '0'}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subscription Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Subscription tracking (₹25/year per shop) coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
