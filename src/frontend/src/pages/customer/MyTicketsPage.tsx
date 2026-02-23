import RoleGuard from '../../components/auth/RoleGuard';
import { Button } from '../../components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import { useState } from 'react';
import CreateTicketModal from '../../components/shared/CreateTicketModal';

export default function MyTicketsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <RoleGuard allowedRoles={['customer', 'shopkeeper']}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
            <p className="text-muted-foreground">
              Get help with your orders and issues
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
        </div>

        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No tickets yet</h3>
          <p className="text-muted-foreground">
            Create a ticket if you need help
          </p>
        </div>

        {showCreateModal && (
          <CreateTicketModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    </RoleGuard>
  );
}
