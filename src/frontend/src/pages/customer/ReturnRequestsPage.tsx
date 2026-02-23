import RoleGuard from '../../components/auth/RoleGuard';
import { Package } from 'lucide-react';

export default function ReturnRequestsPage() {
  return (
    <RoleGuard allowedRoles={['customer']}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Return Requests</h1>
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No return requests</h3>
          <p className="text-muted-foreground">
            Your return requests will appear here
          </p>
        </div>
      </div>
    </RoleGuard>
  );
}
