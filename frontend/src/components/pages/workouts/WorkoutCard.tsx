import { Workout } from '@/types/Workout';
import { formatDistance } from 'date-fns';
import {
  Dumbbell,
  Calendar,
  Info,
  ChevronRight,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { routes } from '@/lib/constants';
import { useNavigate } from 'react-router';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';

interface WorkoutCardProps {
  workout: Workout;
  viewOnly?: boolean;
  compact?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

const WorkoutCard = ({
  workout,
  viewOnly = false,
  compact = false,
  selected = false,
  onSelect,
}: WorkoutCardProps) => {
  const navigate = useNavigate();
  const { isUserTrainer } = useAuth();
  const formattedDate = workout.createdAt
    ? formatDistance(new Date(workout.createdAt), new Date(), {
        addSuffix: true,
      })
    : 'Unknown date';

  const restTimeInMinutes = workout.restTimeSeconds
    ? Math.round((workout.restTimeSeconds / 60) * 10) / 10
    : null;

  const handleEditWorkout = () => {
    navigate(routes.EditWorkout(workout.id));
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold">
            {workout.name || 'Unnamed Workout'}
          </h3>
          {workout.trainerId && workout.trainer && !isUserTrainer && (
            <Badge
              variant="secondary"
              className="flex items-center gap-1 self-start cursor-pointer"
            >
              <UserCheck className="h-3 w-3" />
              <span>By {workout.trainer.name}</span>
            </Badge>
          )}
          {!compact && (
            <div className="flex items-center text-muted-foreground mt-1 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
        {!viewOnly && (
          <Button
            onClick={handleEditWorkout}
            variant="ghost"
            size="icon"
            aria-label="More details"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>

      {workout.description && !compact && (
        <div className="mt-3 flex items-start">
          <Info className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{workout.description}</p>
        </div>
      )}

      <div className="mt-4 border-t bordeSelectr-border pt-3">
        <div className="flex items-center text-sm">
          <Dumbbell className="h-4 w-4 mr-2 text-primary" />
          <span>{workout.sets?.length || 0} exercises</span>
        </div>

        {workout.sets && workout.sets.length > 0 && !compact && (
          <div className="mt-2 space-y-2">
            {workout.sets.slice(0, 2).map((set) => (
              <div
                key={set.id}
                className="flex items-center justify-between bg-background rounded p-2 text-sm"
              >
                <span>{set.exercise.name}</span>
                <span className="text-muted-foreground">
                  {set.repetitions} reps {set.weight ? `• ${set.weight}kg` : ''}
                </span>
              </div>
            ))}
            {workout.sets.length > 2 && (
              <div className="text-xs text-center text-muted-foreground mt-1">
                +{workout.sets.length - 2} more sets
              </div>
            )}
          </div>
        )}

        {restTimeInMinutes && (
          <div className="flex items-center text-sm mt-2">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            <span>Rest time: {restTimeInMinutes} min</span>
          </div>
        )}

        {(viewOnly || selected) && (
          <div className="flex items-center text-sm mt-2">
            <Button
              variant={selected ? 'default' : 'outline'}
              onClick={onSelect}
            >
              {selected ? 'Selected' : 'Select'} workout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutCard;
