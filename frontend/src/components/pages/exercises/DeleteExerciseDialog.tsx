import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Exercise } from '@/types/Exercise';
import { useDeleteExercise } from '@/hooks/useExercises';
import { toast } from 'sonner';

interface DeleteExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Exercise;
}

const DeleteExerciseDialog = ({
  open,
  onOpenChange,
  exercise,
}: DeleteExerciseDialogProps) => {
  const deleteExercise = useDeleteExercise();

  const handleDelete = async () => {
    try {
      await deleteExercise.mutateAsync(exercise.id);
      toast.success('Exercise deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete exercise. It may be in use by a workout.');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{exercise.name}"? This action
            cannot be undone. This exercise cannot be deleted if it's being used
            in any workouts.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteExercise.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteExercise.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteExerciseDialog;
