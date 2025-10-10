import { Invitation, InvitationStatus } from '@/types/Interaction';
import { Button } from '@/components/ui/button';
import {
  User,
  Calendar,
  MessageSquare,
  Check,
  X,
  Mail,
  DotIcon,
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { toast } from 'sonner';
import InvitationBadge from '@/components/pages/user/InvitationBadge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useResolveInvitation } from '@/hooks/useInvitations';

interface InvitationsListItemProps {
  invitation: Invitation;
}

const InvitationsListItem = ({ invitation }: InvitationsListItemProps) => {
  const { isUserClient, userId } = useAuth();
  const resolveInvitation = useResolveInvitation();

  const handleAccept = async () => {
    await resolveInvitation.mutateAsync({
      invitationId: invitation.id,
      status: InvitationStatus.Accepted,
    });
    toast.success('Invitation accepted!');
  };

  const handleReject = async () => {
    await resolveInvitation.mutateAsync({
      invitationId: invitation.id,
      status: InvitationStatus.Rejected,
    });
    toast.success('Invitation rejected');
  };

  const isCurrentUserInitiator = invitation.initiatorId === userId;
  const isPending = invitation.status === InvitationStatus.Pending;

  const otherUser = isUserClient ? invitation.trainer : invitation.client;

  const relativeDateCreated = formatDistance(
    new Date(invitation.createdAt),
    new Date(),
    { addSuffix: true },
  );

  return (
    <div
      className={`bg-card rounded-lg border border-border p-4 shadow-sm hover:shadow-md transition-all ${invitation.status === InvitationStatus.Rejected ? 'opacity-50' : ''
        }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {otherUser?.name || 'Unknown User'}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              {otherUser?.email || 'No email'}
            </div>
          </div>
        </div>
        <InvitationBadge status={invitation.status} />
      </div>

      <div className="flex items-center gap-0.5 text-sm text-muted-foreground mb-3">
        <span className="px-2 py-1 bg-secondary rounded text-xs font-medium">
          {otherUser?.role}
        </span>
        <DotIcon className="h-3 w-3" />
        <span>
          {isCurrentUserInitiator ? 'Sent invitation' : 'Received invitation'}
        </span>
      </div>

      {invitation.message && (
        <div className="bg-background rounded-md p-3 mb-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
            <p className="text-sm">{invitation.message}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {relativeDateCreated}
        </div>

        <div className="flex items-center gap-2">
          {isPending && !isCurrentUserInitiator && (
            <>
              <Button size="sm" variant="destructive" onClick={handleReject}>
                <X className="h-3 w-3 mr-1" />
                Reject
              </Button>
              <Button size="sm" onClick={handleAccept} variant="green">
                <Check className="h-3 w-3 mr-1" />
                Accept
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitationsListItem;
