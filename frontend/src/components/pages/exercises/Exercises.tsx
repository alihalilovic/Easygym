import { useState } from 'react';
import ExerciseDialog from '@/components/pages/exercises/ExerciseDialog';
import DeleteExerciseDialog from '@/components/pages/exercises/DeleteExerciseDialog';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon, Pencil, Trash2 } from 'lucide-react';
import EmptyState from '@/components/ui/widgets/EmptyState';
import { useExercises } from '@/hooks/useExercises';
import { SortableTable, Column } from '@/components/ui/widgets/SortableTable';
import { Exercise } from '@/types/Exercise';
import { Badge } from '@/components/ui/badge';

const Exercises = () => {
  const { data: exercises = [], isLoading } = useExercises();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null,
  );

  const handleCreateExercise = () => {
    setIsCreateDialogOpen(true);
  };

  const handleEditExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsEditDialogOpen(true);
  };

  const handleDeleteExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDeleteDialogOpen(true);
  };

  const columns: Column<Exercise>[] = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      className: 'font-medium max-w-[200px]',
    },
    {
      key: 'description',
      label: 'Description',
      sortable: false,
      render: (exercise) => (
        <div className="max-w-md overflow-hidden">
          <span className="text-muted-foreground line-clamp-2 break-words">
            {exercise.description || '-'}
          </span>
        </div>
      ),
      className: 'max-w-[300px] truncate',
    },
    {
      key: 'muscleGroup',
      label: 'Muscle Group',
      sortable: true,
      render: (exercise) =>
        exercise.muscleGroup ? (
          <Badge variant="outline">{exercise.muscleGroup}</Badge>
        ) : (
          '-'
        ),
      className: 'w-[150px]',
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (exercise) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditExercise(exercise);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteExercise(exercise);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      className: 'w-[120px]',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {exercises.length > 0 && (
        <>
          <Button className="self-start" onClick={handleCreateExercise}>
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            Create Exercise
          </Button>
          <SortableTable
            data={exercises}
            columns={columns}
            emptyMessage="No exercises found"
          />
        </>
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
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        mode="create"
      />
      {selectedExercise && (
        <>
          <ExerciseDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            mode="edit"
            exercise={selectedExercise}
          />
          <DeleteExerciseDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            exercise={selectedExercise}
          />
        </>
      )}
    </div>
  );
};

export default Exercises;
