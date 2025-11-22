import {
  User as UserIcon,
  Mail,
  Calendar,
  UserCheck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useMyTrainer } from '@/hooks/useConnections';

const MyTrainer = () => {
  const { data: trainerConnection } = useMyTrainer();

  const handleRemoveTrainer = () => {
    // TODO: Implement removing trainer
  };

  if (!trainerConnection) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          title="No trainer assigned"
          description="You don't have a trainer yet. Connect with a professional trainer to get personalized workout plans and guidance."
          buttonText="Find a Trainer"
          buttonAction={handleRemoveTrainer}
          buttonIcon={<Users className="h-4 w-4" />}
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
          <Button variant="destructive" onClick={handleRemoveTrainer}>
            <Users className="h-4 w-4 mr-2" />
            Remove trainer
          </Button>
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
    </div>
  );
};

export default MyTrainer;
