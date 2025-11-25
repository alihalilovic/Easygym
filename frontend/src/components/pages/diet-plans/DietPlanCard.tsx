import { DietPlan } from '@/types/DietPlan';
import { formatDistance } from 'date-fns';
import {
  Calendar,
  ChevronRight,
  UtensilsCrossed,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/constants';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';

interface DietPlanCardProps {
  dietPlan: DietPlan;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DietPlanCard = ({ dietPlan }: DietPlanCardProps) => {
  const navigate = useNavigate();
  const { isUserTrainer, user } = useAuth();
  const formattedDate = dietPlan.createdAt
    ? formatDistance(new Date(dietPlan.createdAt), new Date(), {
        addSuffix: true,
      })
    : 'Unknown date';

  const totalMeals = dietPlan.days.reduce(
    (acc, day) => acc + day.meals.length,
    0,
  );

  // For clients, check if they have an active assignment
  const myAssignment = !isUserTrainer
    ? dietPlan.assignments?.find((a) => a.clientId === user?.id)
    : null;
  const isActiveForMe = myAssignment?.isActive || false;

  // For trainers, count how many clients have this plan assigned
  const assignedClientsCount = isUserTrainer
    ? dietPlan.assignments?.length || 0
    : 0;

  const handleOpenDietPlan = () => {
    if (isUserTrainer) {
      navigate(routes.EditDietPlan(dietPlan.id));
    } else {
      navigate(routes.ViewDietPlan(dietPlan.id));
    }
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-semibold">{dietPlan.name}</h3>
            {!isUserTrainer && isActiveForMe && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                <span>Active</span>
              </Badge>
            )}
          </div>
          {dietPlan.trainerId && dietPlan.trainer && !isUserTrainer && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 self-start"
            >
              <UserCheck className="h-3 w-3" />
              <span>By {dietPlan.trainer.name}</span>
            </Badge>
          )}
          {isUserTrainer && assignedClientsCount > 0 && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 self-start"
            >
              <UserCheck className="h-3 w-3" />
              <span>
                Assigned to {assignedClientsCount} client
                {assignedClientsCount !== 1 ? 's' : ''}
              </span>
            </Badge>
          )}
          <div className="flex items-center text-muted-foreground mt-1 text-sm">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <Button
          onClick={handleOpenDietPlan}
          variant="ghost"
          size="icon"
          aria-label="More details"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center text-sm">
          <UtensilsCrossed className="h-4 w-4 mr-2 text-primary" />
          <span>{totalMeals} meals across 7 days</span>
        </div>

        {dietPlan.days && dietPlan.days.length > 0 && (
          <div className="mt-2 space-y-2">
            {dietPlan.days.slice(0, 2).map((day) => (
              <div
                key={day.id}
                className="flex items-center justify-between bg-background rounded p-2 text-sm"
              >
                <span className="font-medium">
                  {DAYS_OF_WEEK[day.dayOfWeek]}
                </span>
                <span className="text-muted-foreground">
                  {day.meals.length} meal{day.meals.length !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
            {dietPlan.days.length > 2 && (
              <div className="text-xs text-center text-muted-foreground mt-1">
                +{dietPlan.days.length - 2} more days
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DietPlanCard;
