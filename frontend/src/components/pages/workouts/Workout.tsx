import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import FormWrapper from '@/components/ui/widgets/FormWrapper';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Set, Workout } from '@/types/Workout';
import { Plus } from 'lucide-react';
import { routes } from '@/lib/constants';
import { useNavigate, useParams } from 'react-router';
import {
  Dialog,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import SetCard from '@/components/pages/workouts/SetCard';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import {
  useWorkout,
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
} from '@/hooks/useWorkouts';
import { useMyClients } from '@/hooks/useConnections';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExercises } from '@/hooks/useExercises';

const WorkoutForm = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { userId, isUserTrainer } = useAuth();
  const { data: myClients = [] } = useMyClients();
  const { data: exercises = [] } = useExercises();

  const maxRestTimeMinutes = 10;
  const defaultRestTimeMinutes = 3;

  const setDisplayDetailsRef = useRef<HTMLButtonElement>(null);

  const workoutId = useMemo(() => parseInt(params.id as string), [params.id]);
  const formNameText = useMemo(
    () => (workoutId ? 'Update workout' : 'Create workout'),
    [workoutId],
  );

  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();

  const [sets, setSets] = useState<Omit<Set, 'id' | 'exercise'>[] | Set[]>([]);
  const [dialogSetDetails, setDialogSetDetails] = useState<Omit<
    Set,
    'id' | 'exercise'
  > | null>(null);
  const [selectedTraineeId, setSelectedTraineeId] = useState<
    number | undefined
  >(undefined);

  // For editing, fetch the workout by ID
  const { data: existingWorkout } = useWorkout(workoutId, !!workoutId);

  useEffect(() => {
    if (existingWorkout) {
      setSelectedTraineeId(existingWorkout.traineeId);
    }
  }, [existingWorkout]);

  const setFormSchema = z.object({
    exerciseId: z.coerce.number().min(1, { message: 'Exercise is required' }),
    repetitions: z.coerce
      .number()
      .min(1, { message: 'Repetitions is required' }),
    weight: z.coerce.number().optional(),
  });

  const workoutFormSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    restTimeMinutes: z.coerce
      .number()
      .min(0, { message: 'Rest time cannot be negative' })
      .max(10, { message: 'Rest time must be less than 10 minutes' }),
    sets: z.array(setFormSchema),
  });

  const workoutForm = useForm<z.infer<typeof workoutFormSchema>>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: '',
      description: '',
      restTimeMinutes: defaultRestTimeMinutes,
      sets: [],
    },
  });

  const setForm = useForm<z.infer<typeof setFormSchema>>({
    resolver: zodResolver(setFormSchema),
    defaultValues: {
      exerciseId: undefined,
      repetitions: 1,
      weight: 0,
    },
  });

  // Helper function to populate the form with workout data
  const populateFormCached = useCallback(
    (workoutData: Workout | undefined) => {
      workoutForm.setValue('name', workoutData?.name || '');
      workoutForm.setValue('description', workoutData?.description || '');
      workoutForm.setValue(
        'restTimeMinutes',
        (workoutData?.restTimeSeconds || 0) / 60 || defaultRestTimeMinutes,
      );

      if (workoutData?.sets?.length) {
        setSets(workoutData.sets);
      }
    },
    [workoutForm, setSets],
  );

  useEffect(() => {
    if (!workoutId || !existingWorkout) return;
    populateFormCached(existingWorkout);
  }, [workoutId, existingWorkout, populateFormCached]);

  const addSet = (data: z.infer<typeof setFormSchema>) => {
    setSets([...sets, data]);
    setForm.reset();
    toast.success('Set added');
  };

  const removeSet = (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const newSets = [...sets];
    newSets.splice(index, 1);
    setSets(newSets);
  };

  const onSubmit = async (data: z.infer<typeof workoutFormSchema>) => {
    if (sets.length === 0) {
      toast.error('You must add at least one set');
      return;
    }

    if (isUserTrainer && !selectedTraineeId) {
      toast.error('Please select a client to assign this workout to');
      return;
    }

    const workoutData = {
      ...data,
      sets,
      traineeId: selectedTraineeId || userId,
      restTimeSeconds: (Math.round(data.restTimeMinutes * 100) / 100) * 60,
    };

    if (!workoutId) {
      await createWorkout.mutateAsync(workoutData);
    } else {
      await updateWorkout.mutateAsync({
        workoutId,
        workout: workoutData,
      });
    }

    toast.success(`Workout ${workoutId ? 'updated' : 'created'} successfully`);
    navigate(routes.Workouts);
  };

  const handleAddSet = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setForm.handleSubmit(addSet)();
  };

  const handleDeleteWorkout = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    await deleteWorkout.mutateAsync(workoutId);
    toast.success('Workout deleted successfully');
    navigate(routes.Workouts);
  };

  const handleSetDisplaySetDetails = (set: Omit<Set, 'id' | 'exercise'>) => {
    setDialogSetDetails(set);
    setDisplayDetailsRef.current?.click();
  };

  const handleDuplicateSet = (
    set: Omit<Set, 'id' | 'exercise'> | Set,
    index: number,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const newSet: Omit<Set, 'id' | 'exercise'> = {
      exerciseId: set.exerciseId,
      repetitions: set.repetitions,
      weight: set.weight,
    };

    const newSets = [...sets];
    newSets.splice(index + 1, 0, newSet);
    setSets(newSets);
  };

  return (
    <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-3xl font-bold tracking-tight">{formNameText}</h2>
          <p className="text-muted-foreground mt-1">
            {workoutId
              ? 'Modify your workout details and sets'
              : 'Create a new workout program with custom exercises'}
          </p>
        </div>

        <div className="p-6">
          {isUserTrainer && !workoutId && myClients.length > 0 && (
            <div className="mb-6 p-4 bg-accent/50 rounded-lg border">
              <label className="text-sm font-semibold mb-3 block">
                Assign to Client
              </label>
              <Select
                value={selectedTraineeId?.toString()}
                onValueChange={(value) => setSelectedTraineeId(parseInt(value))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {myClients.map((clientConnection) => (
                    <SelectItem
                      key={clientConnection.client.id}
                      value={clientConnection.client.id.toString()}
                    >
                      {clientConnection.client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Form {...workoutForm}>
            <FormWrapper
              className="w-full space-y-6"
              onSubmit={workoutForm.handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <FormField
                  control={workoutForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Workout Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Upper Body Strength"
                          className="h-11"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={workoutForm.control}
                  name="restTimeMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Rest Time (minutes)
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            min={0}
                            step={0.5}
                            max={maxRestTimeMinutes}
                            className="h-11"
                            {...field}
                          />
                          <div className="flex items-center gap-2">
                            <Progress
                              value={field.value * maxRestTimeMinutes}
                              className="flex-1"
                            />
                            <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
                              {field.value} min
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={workoutForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem fullWidth>
                    <FormLabel className="text-base font-semibold">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the workout goals, intensity, or any special notes..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">Exercise Sets</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {sets.length === 0
                        ? 'Add exercises to your workout'
                        : `${sets.length} set${
                            sets.length !== 1 ? 's' : ''
                          } added`}
                    </p>
                  </div>
                </div>

                {sets.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                    {sets.map((set, index) => (
                      <SetCard
                        key={index}
                        set={set}
                        index={index}
                        exercises={exercises}
                        setDisplaySetDetails={handleSetDisplaySetDetails}
                        duplicateSet={handleDuplicateSet}
                        removeSet={removeSet}
                      />
                    ))}
                  </div>
                )}

                <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed">
                  <h4 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                    Add New Set
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={setForm.control}
                      name="exerciseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exercise</FormLabel>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) =>
                              field.onChange(parseInt(value))
                            }
                          >
                            <FormControl>
                              <SelectTrigger className="h-11">
                                <SelectValue placeholder="Select exercise" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {exercises.map((exercise) => (
                                <SelectItem
                                  key={exercise.id}
                                  value={exercise.id.toString()}
                                >
                                  {exercise.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={setForm.control}
                      name="repetitions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Repetitions</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="12"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={setForm.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Optional"
                              className="h-11"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {exercises.length === 0 ? (
                    <div className="mt-4 p-3 bg-background rounded border">
                      <p className="text-sm text-muted-foreground">
                        No exercises available. Please create exercises first by
                        visiting the Exercises page.
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={handleAddSet}
                      variant="secondary"
                      className="mt-4 w-full h-11"
                      disabled={exercises.length === 0}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Set to Workout
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t">
                <Button type="submit" className="h-11 px-8" size="lg">
                  {workoutId ? 'Update Workout' : 'Create Workout'}
                </Button>
                {!!workoutId && (
                  <Dialog>
                    <Button
                      variant="destructive"
                      className="h-11"
                      size="lg"
                      asChild
                    >
                      <DialogTrigger>Delete Workout</DialogTrigger>
                    </Button>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently
                          delete your workout program and its related data from
                          our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteWorkout}
                        >
                          Delete Workout
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
              <Dialog>
                <Button variant="destructive" className="mt-6" asChild>
                  <DialogTrigger
                    className="invisible"
                    ref={setDisplayDetailsRef}
                  />
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Set Details -{' '}
                      {exercises.find(
                        (ex) => ex.id === dialogSetDetails?.exerciseId,
                      )?.name || 'Unknown Exercise'}
                    </DialogTitle>
                    <DialogDescription className="flex flex-col gap-2 break-all">
                      <span>
                        <span className="font-bold">Exercise:</span>{' '}
                        {exercises.find(
                          (ex) => ex.id === dialogSetDetails?.exerciseId,
                        )?.name || 'Unknown'}
                      </span>
                      <span>
                        <span className="font-bold">Repetitions:</span>{' '}
                        {dialogSetDetails?.repetitions}
                      </span>
                      {!!dialogSetDetails?.weight &&
                        dialogSetDetails.weight > 0 && (
                          <span>
                            <span className="font-bold">Weight:</span>{' '}
                            {dialogSetDetails.weight} kg
                          </span>
                        )}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </FormWrapper>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default WorkoutForm;
