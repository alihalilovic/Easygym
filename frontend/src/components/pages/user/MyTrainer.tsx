import {
  User as UserIcon,
  Mail,
  Calendar,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/widgets/EmptyState';
import ConnectionHistory from '@/components/ui/widgets/ConnectionHistory';
import { useMyTrainer, useRemoveMyTrainer, useMyTrainerHistory } from '@/hooks/useConnections';
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

const MyTrainer = () => {
  const { data: trainerConnection } = useMyTrainer();
  const { data: trainerHistory } = useMyTrainerHistory();
  const removeTrainer = useRemoveMyTrainer();
  const navigate = useNavigate();

  const handleRemoveTrainer = () => {
    removeTrainer.mutate(undefined, {
      onSuccess: () => {
        toast.success('Your trainer has been successfully removed.');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to remove trainer.');
      },
    });
  };

  const handleFindTrainer = () => {
    navigate(routes.Invitations);
  };

  if (!trainerConnection) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          title="No trainer assigned"
          description="You don't have a trainer yet. Connect with a professional trainer to get personalized workout plans and guidance."
          buttonText="Find a Trainer"
          buttonAction={handleFindTrainer}
          buttonIcon={<Users className="h-4 w-4" />}
        />

        <ConnectionHistory
          title="Previous Trainers"
          history={
            trainerHistory?.map((h) => ({
              user: h.trainer,
              invitationAcceptedAt: h.invitationAcceptedAt,
              connectionEndedAt: h.connectionEndedAt,
            })) || []
          }
        />
      </div>
    );
  }

  const { trainer, invitationAcceptedAt } = trainerConnection;

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-solid">
        My Trainer
      </h2>

      <div className="bg-card rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <UserIcon className="h-8 w-8 text-primary" />
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-foreground">
                {trainer.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  Personal Trainer
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {trainer.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Member since
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trainer.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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
            onClick={() => (window.location.href = `mailto:${trainer.email}`)}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Trainer
          </Button>
          <Dialog>
            <Button
              variant="destructive"
              asChild
              disabled={removeTrainer.isPending}
            >
              <DialogTrigger>
                <Users className="h-4 w-4 mr-2" />
                {removeTrainer.isPending ? 'Removing...' : 'Remove trainer'}
              </DialogTrigger>
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Remove trainer?</DialogTitle>
                <DialogDescription>
                  Are you sure you want to remove {trainer.name} as your
                  trainer? This action cannot be undone and will disconnect your
                  training relationship.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={handleRemoveTrainer}
                  disabled={removeTrainer.isPending}
                >
                  {removeTrainer.isPending ? 'Removing...' : 'Remove Trainer'}
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-xl p-6 shadow-sm border">
        <h4 className="text-lg font-semibold mb-4">Training Relationship</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-green-600 dark:text-green-400">
                Active
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Connected</p>
              <p className="text-sm text-muted-foreground">
                {invitationAcceptedAt
                  ? new Date(invitationAcceptedAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ConnectionHistory
        title="Previous Trainers"
        history={
          trainerHistory?.map((h) => ({
            user: h.trainer,
            invitationAcceptedAt: h.invitationAcceptedAt,
            connectionEndedAt: h.connectionEndedAt,
          })) || []
        }
      />
    </div>
  );
};

export default MyTrainer;
