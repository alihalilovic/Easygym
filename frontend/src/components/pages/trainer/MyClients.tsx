import {
  User as UserIcon,
  Mail,
  Calendar,
  UserCheck,
  Users,
  UserX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/widgets/EmptyState';
import ConnectionHistory from '@/components/ui/widgets/ConnectionHistory';
import { useMyClients, useRemoveClient, useMyClientHistory } from '@/hooks/useConnections';
import { useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const MyClients = () => {
  const { data: clients = [] } = useMyClients();
  const { data: clientHistory = [] } = useMyClientHistory();
  const removeClient = useRemoveClient();
  const navigate = useNavigate();

  const handleRemoveClient = (clientId: number, clientName: string) => {
    removeClient.mutate(clientId, {
      onSuccess: () => {
        toast.success(`${clientName} removed successfully`);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove client');
      },
    });
  };

  const handleFindClients = () => {
    navigate(routes.Invitations);
  };

  if (clients.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          title="No clients yet"
          description="You don't have any clients yet. Send invitations to potential clients to grow your training business."
          buttonText="Send Invitations"
          buttonAction={handleFindClients}
          buttonIcon={<Users className="h-4 w-4" />}
        />

        <ConnectionHistory
          title="Previous Clients"
          history={clientHistory.map((h) => ({
            user: h.client,
            invitationAcceptedAt: h.invitationAcceptedAt,
            connectionEndedAt: h.connectionEndedAt,
          }))}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-solid">
        <h2 className="text-2xl font-bold">My Clients</h2>
        <div className="text-sm text-muted-foreground">
          {clients.length} {clients.length === 1 ? 'client' : 'clients'}
        </div>
      </div>

      <div className="grid gap-4">
        {clients.map(({ client, invitationAcceptedAt }) => (
          <div
            key={client.id}
            className="bg-card rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-8 w-8 text-primary" />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {client.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      Active Client
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Email
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {client.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Connected on
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invitationAcceptedAt
                          ? new Date(invitationAcceptedAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              },
                            )
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() =>
                  (window.location.href = `mailto:${client.email}`)
                }
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Client
              </Button>
              <Dialog>
                <Button
                  variant="destructive"
                  asChild
                  disabled={removeClient.isPending}
                >
                  <DialogTrigger>
                    <UserX className="h-4 w-4 mr-2" />
                    {removeClient.isPending ? 'Removing...' : 'Remove client'}
                  </DialogTrigger>
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remove client?</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to remove {client.name} as your
                      client? This action cannot be undone and will disconnect
                      your training relationship.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="destructive"
                      onClick={() => handleRemoveClient(client.id, client.name)}
                      disabled={removeClient.isPending}
                    >
                      {removeClient.isPending ? 'Removing...' : 'Remove Client'}
                    </Button>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>

      <ConnectionHistory
        title="Previous Clients"
        history={clientHistory.map((h) => ({
          user: h.client,
          invitationAcceptedAt: h.invitationAcceptedAt,
          connectionEndedAt: h.connectionEndedAt,
        }))}
      />
    </div>
  );
};

export default MyClients;
