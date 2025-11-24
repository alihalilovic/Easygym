import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Exercise } from '@/types/Exercise';
import { useCreateExercise, useUpdateExercise } from '@/hooks/useExercises';
import { toast } from 'sonner';

const exerciseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  muscleGroup: z.string().max(50, 'Muscle group is too long').optional(),
  instructions: z.string().max(2000, 'Instructions are too long').optional(),
});

type ExerciseFormValues = z.infer<typeof exerciseSchema>;

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  exercise?: Exercise;
}

const ExerciseDialog = ({
  open,
  onOpenChange,
  mode,
  exercise,
}: ExerciseDialogProps) => {
  const createExercise = useCreateExercise();
  const updateExercise = useUpdateExercise();

  const form = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: '',
      description: '',
      muscleGroup: '',
      instructions: '',
    },
  });

  useEffect(() => {
    const isEditMode = mode === 'edit' && exercise;
    form.reset({
      name: isEditMode ? exercise.name : '',
      description: isEditMode ? exercise.description : '',
      muscleGroup: isEditMode ? exercise.muscleGroup : '',
      instructions: isEditMode ? exercise.instructions : '',
    });
  }, [mode, exercise, form]);

  const onSubmit = async (data: ExerciseFormValues) => {
    try {
      if (mode === 'create') {
        await createExercise.mutateAsync(data);
        toast.success('Exercise created successfully');
      } else if (exercise) {
        await updateExercise.mutateAsync({
          exerciseId: exercise.id,
          exercise: data,
        });
        toast.success('Exercise updated successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        mode === 'create'
          ? 'Failed to create exercise'
          : 'Failed to update exercise',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Exercise' : 'Edit Exercise'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new exercise to your encyclopedia.'
              : 'Edit the exercise details.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Bicep Curls" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the exercise"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="muscleGroup"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Muscle Group</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Biceps" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="instructions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instructions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How to perform this exercise"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createExercise.isPending || updateExercise.isPending}
              >
                {mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDialog;
