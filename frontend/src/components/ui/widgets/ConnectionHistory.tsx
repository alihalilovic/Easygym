import { User } from '@/types/User';
import { Avatar } from '@/components/ui/Avatar';

interface ConnectionHistoryItem {
  user: User;
  invitationAcceptedAt: Date | null;
  connectionEndedAt?: Date | null;
}

interface ConnectionHistoryProps {
  title: string;
  history: ConnectionHistoryItem[];
}

const ConnectionHistory = ({ title, history }: ConnectionHistoryProps) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-6 shadow-sm border">
      <h4 className="text-lg font-semibold mb-4">{title}</h4>
      <div className="space-y-3">
        {history.map((item) => (
          <div
            key={item.user.id}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Avatar
                profilePictureUrl={item.user.profilePictureUrl}
                userName={item.user.name}
                size="sm"
                className="bg-muted"
              />
              <div>
                <p className="font-medium">{item.user.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.user.email}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>
                {item.invitationAcceptedAt &&
                  new Date(item.invitationAcceptedAt).toLocaleDateString()}{' '}
                -{' '}
                {item.connectionEndedAt &&
                  new Date(item.connectionEndedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConnectionHistory;
