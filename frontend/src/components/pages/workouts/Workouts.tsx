import { useStore } from '@/store/store';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import WorkoutCard from '@/components/pages/workouts/WorkoutCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';
import { routes } from '@/lib/constants';
import { PlusCircleIcon } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useAuth } from '@/components/auth/AuthProvider';

const Workouts = observer(() => {
  const { workout } = useStore();
  const { userId } = useAuth();
  const { workouts, fetchWorkouts, isLoading } = workout;
  const navigate = useNavigate();

  useEffect(() => {
    let ignore = false;

    if (!ignore) {
      fetchWorkouts(userId);
    }

    return () => {
      ignore = true;
    };
  }, [fetchWorkouts, userId]);

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
      {workouts.length === 0 && !isLoading && (
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
});

export default Workouts;
