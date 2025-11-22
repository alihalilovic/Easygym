import WorkoutCard from '@/components/pages/workouts/WorkoutCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { PlusCircleIcon } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWorkouts, useTrainerWorkouts } from '@/hooks/useWorkouts';
import { useMemo } from 'react';

const Workouts = () => {
  const { userId, isUserTrainer } = useAuth();
  const { data: myWorkouts = [], isLoading: isLoadingMyWorkouts } = useWorkouts(
    isUserTrainer ? 0 : userId,
  );
  const { data: trainerWorkouts = [], isLoading: isLoadingTrainerWorkouts } =
    useTrainerWorkouts(isUserTrainer ? userId : 0);
  const navigate = useNavigate();

  const workouts = useMemo(() => {
    return isUserTrainer ? [...myWorkouts, ...trainerWorkouts] : myWorkouts;
  }, [isUserTrainer, myWorkouts, trainerWorkouts]);

  const handleCreateWorkout = () => {
    navigate(routes.CreateWorkout);
  };

  return (
    <div className="flex flex-col gap-2">
      {workouts.length > 0 && (
        <div className="flex flex-col gap-2">
          <Button className="self-start" onClick={handleCreateWorkout}>
            Create Workout
          </Button>
          <div className="workout-card-wrapper">
            {workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        </div>
      )}
      {workouts.length === 0 &&
        !isLoadingMyWorkouts &&
        !isLoadingTrainerWorkouts && (
          <EmptyState
            title="No workouts yet"
            description="Create your first workout to get started with your training program."
            buttonText="Create Your First Workout"
            buttonAction={handleCreateWorkout}
            buttonIcon={<PlusCircleIcon className="h-4 w-4" />}
          />
        )}
    </div>
  );
};

export default Workouts;
