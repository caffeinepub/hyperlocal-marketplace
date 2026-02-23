import RoleGuard from '../../components/auth/RoleGuard';
import { useGetAllTickets, useUpdateTicketStatus } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { TicketStatus } from '../../backend';

const statusColors: Record<string, string> = {
  open: 'bg-yellow-500',
  inProgress: 'bg-blue-500',
  resolved: 'bg-success-green',
  closed: 'bg-gray-500',
};

export default function TicketsPage() {
  const { data: tickets = [], isLoading } = useGetAllTickets();
  const updateStatus = useUpdateTicketStatus();

  const openTickets = tickets.filter((t) => {
    const key = Object.keys(TicketStatus).find(
      (k) => TicketStatus[k as keyof typeof TicketStatus] === t.status
    );
    return key === 'open';
  });

  const inProgressTickets = tickets.filter((t) => {
    const key = Object.keys(TicketStatus).find(
      (k) => TicketStatus[k as keyof typeof TicketStatus] === t.status
    );
    return key === 'inProgress';
  });

  const resolvedTickets = tickets.filter((t) => {
    const key = Object.keys(TicketStatus).find(
      (k) => TicketStatus[k as keyof typeof TicketStatus] === t.status
    );
    return key === 'resolved' || key === 'closed';
  });

  const handleUpdateStatus = async (ticketId: bigint, status: TicketStatus) => {
    try {
      await updateStatus.mutateAsync({ ticketId, status });
      toast.success('Ticket status updated');
    } catch (error) {
      toast.error('Failed to update ticket');
    }
  };

  if (isLoading) {
    return (
      <RoleGuard allowedRoles={['admin']}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-trust-blue border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tickets...</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={['admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage customer and shopkeeper support requests
          </p>
        </div>

        <Tabs defaultValue="open">
          <TabsList>
            <TabsTrigger value="open">Open ({openTickets.length})</TabsTrigger>
            <TabsTrigger value="inProgress">In Progress ({inProgressTickets.length})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({resolvedTickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-6">
            {openTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No open tickets</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {openTickets.map((ticket) => (
                  <Card key={ticket.id.toString()}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">Ticket #{ticket.id.toString()}</CardTitle>
                        <Badge className="bg-yellow-500">Open</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{ticket.issue}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(ticket.id, TicketStatus.inProgress)}
                          disabled={updateStatus.isPending}
                        >
                          Start Working
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(ticket.id, TicketStatus.resolved)}
                          disabled={updateStatus.isPending}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inProgress" className="mt-6">
            {inProgressTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tickets in progress</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {inProgressTickets.map((ticket) => (
                  <Card key={ticket.id.toString()}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">Ticket #{ticket.id.toString()}</CardTitle>
                        <Badge className="bg-blue-500">In Progress</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{ticket.issue}</p>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateStatus(ticket.id, TicketStatus.resolved)}
                        disabled={updateStatus.isPending}
                      >
                        Mark Resolved
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="resolved" className="mt-6">
            {resolvedTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No resolved tickets</h3>
              </div>
            ) : (
              <div className="space-y-4">
                {resolvedTickets.map((ticket) => {
                  const statusKey = Object.keys(TicketStatus).find(
                    (k) => TicketStatus[k as keyof typeof TicketStatus] === ticket.status
                  );
                  return (
                    <Card key={ticket.id.toString()}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">Ticket #{ticket.id.toString()}</CardTitle>
                          <Badge className={statusKey === 'resolved' ? 'bg-success-green' : 'bg-gray-500'}>
                            {statusKey === 'resolved' ? 'Resolved' : 'Closed'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">{ticket.issue}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleGuard>
  );
}
