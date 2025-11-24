import { useState } from 'react';
import ExerciseCard from '@/components/pages/exercises/ExerciseCard';
import ExerciseDialog from '@/components/pages/exercises/ExerciseDialog';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useExercises } from '@/hooks/useExercises';

const Exercises = () => {
  const { data: exercises = [], isLoading } = useExercises();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateExercise = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-2">
      {exercises.length > 0 && (
        <div className="flex flex-col gap-2">
          <Button className="self-start" onClick={handleCreateExercise}>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Create Exercise
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exercises.map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} />
            ))}
          </div>
        </div>
      )}
      {exercises.length === 0 && !isLoading && (
        <EmptyState
          title="No exercises yet"
          description="Create your first exercise to build your personal exercise encyclopedia."
          buttonText="Create Your First Exercise"
          buttonAction={handleCreateExercise}
          buttonIcon={<PlusCircleIcon className="h-4 w-4" />}
        />
      )}
      <ExerciseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode="create"
      />
    </div>
  );
};

export default Exercises;
