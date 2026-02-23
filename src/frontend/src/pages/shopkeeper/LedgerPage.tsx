import RoleGuard from '../../components/auth/RoleGuard';
import { useAuth } from '../../hooks/useAuth';
import { useGetShopOrders } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { TrendingUp } from 'lucide-react';
import { OrderStatus } from '../../backend';

export default function LedgerPage() {
  const { userProfile } = useAuth();
  const { data: orders = [] } = useGetShopOrders(userProfile?.shopId || null);

  const completedOrders = orders.filter((o) => {
    const statusKey = Object.keys(OrderStatus).find(
      (key) => OrderStatus[key as keyof typeof OrderStatus] === o.status
    );
    return statusKey === 'delivered';
  });

  const totalSales = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = completedOrders.reduce((sum, o) => sum + o.platformCommission, 0);
  const netEarnings = totalSales - totalCommission;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyOrders = completedOrders.filter((o) => {
    const orderDate = new Date(Number(o.timestamp) / 1000000);
    return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
  });

  const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.total, 0);
  const monthlyCommission = monthlyOrders.reduce((sum, o) => sum + o.platformCommission, 0);
  const monthlyNet = monthlySales - monthlyCommission;

  return (
    <RoleGuard allowedRoles={['shopkeeper']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Digital Ledger</h1>
          <p className="text-muted-foreground">
            Track your sales and commission breakdown
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Sales (All Time)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{totalSales.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Commission Paid (2%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                -₹{totalCommission.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Net Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success-green">
                ₹{netEarnings.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Sales</p>
                <p className="text-xl font-bold">₹{monthlySales.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commission</p>
                <p className="text-xl font-bold text-destructive">
                  -₹{monthlyCommission.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net</p>
                <p className="text-xl font-bold text-success-green">
                  ₹{monthlyNet.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {completedOrders.length === 0 ? (
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No completed orders yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead className="text-right">Gross Sale</TableHead>
                    <TableHead className="text-right">Commission (2%)</TableHead>
                    <TableHead className="text-right">Net Earning</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedOrders.map((order) => {
                    const date = new Date(Number(order.timestamp) / 1000000);
                    const net = order.total - order.platformCommission;
                    return (
                      <TableRow key={order.id.toString()}>
                        <TableCell>{date.toLocaleDateString()}</TableCell>
                        <TableCell>#{order.id.toString()}</TableCell>
                        <TableCell className="text-right">
                          ₹{order.total.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right text-destructive">
                          -₹{order.platformCommission.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium text-success-green">
                          ₹{net.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleGuard>
  );
}
