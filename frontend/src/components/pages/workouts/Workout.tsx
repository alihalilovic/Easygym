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

  const [sets, setSets] = useState<Omit<Set, 'id'>[] | Set[]>([]);
  const [dialogSetDetails, setDialogSetDetails] = useState<Omit<
    Set,
    'id'
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
      exerciseId: 0,
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

  const handleSetDisplaySetDetails = (set: Omit<Set, 'id'>) => {
    setDialogSetDetails(set);
    setDisplayDetailsRef.current?.click();
  };

  const handleDuplicateSet = (
    set: Omit<Set, 'id'> | Set,
    index: number,
    e: React.MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const newSet: Omit<Set, 'id'> = {
      exerciseId: set.exerciseId,
      repetitions: set.repetitions,
      weight: set.weight,
    };

    const newSets = [...sets];
    newSets.splice(index + 1, 0, newSet);
    setSets(newSets);
  };

  return (
    <div className="space-y-8 mx-auto">
      <div>
        <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-solid">
          {formNameText}
        </h2>
        {isUserTrainer && !workoutId && myClients.length > 0 && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              Assign to Client
            </label>
            <Select
              value={selectedTraineeId?.toString()}
              onValueChange={(value) => setSelectedTraineeId(parseInt(value))}
            >
              <SelectTrigger className="w-full max-w-md">
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
            className="w-full"
            onSubmit={workoutForm.handleSubmit(onSubmit)}
          >
            <FormField
              control={workoutForm.control}
              name="name"
              render={({ field }) => (
                <FormItem fullWidth>
                  <FormLabel>Workout Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter workout name..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={workoutForm.control}
              name="description"
              render={({ field }) => (
                <FormItem fullWidth>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your workout..."
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
                <FormItem fullWidth>
                  <FormLabel>Rest Time (minutes)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-1 max-w-[50%]">
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        max={maxRestTimeMinutes}
                        {...field}
                      />
                      <div className="w-full">
                        <Progress value={field.value * maxRestTimeMinutes} />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="mt-8">
              <h3 className="text-xl font-bold">Sets</h3>
              {sets.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mb-6 mt-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4 w-[50%]">
              <FormField
                control={setForm.control}
                name="exerciseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exercise</FormLabel>
                    <Select
                      value={field.value?.toString()}
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an exercise" />
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
                      <Input type="number" {...field} />
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
                    <FormLabel>Weight (kg, optional)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {exercises.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                No exercises available. Please create exercises first by visiting
                the Exercises page.
              </p>
            )}
            <Button
              onClick={handleAddSet}
              variant="outline"
              className="mt-2"
              disabled={exercises.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" /> Add Set
            </Button>
            <div className="flex gap-2">
              <Button type="submit" className="mt-6">
                {workoutId ? 'Update' : 'Create'}
              </Button>
              {!!workoutId && (
                <Dialog>
                  <Button variant="destructive" className="mt-6" asChild>
                    <DialogTrigger>Delete</DialogTrigger>
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
                      <Button
                        variant="destructive"
                        onClick={handleDeleteWorkout}
                      >
                        Delete Workout
                      </Button>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
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
                    {exercises.find((ex) => ex.id === dialogSetDetails?.exerciseId)
                      ?.name || 'Unknown Exercise'}
                  </DialogTitle>
                  <DialogDescription className="flex flex-col gap-2 break-all">
                    <span>
                      <span className="font-bold">Exercise:</span>{' '}
                      {exercises.find((ex) => ex.id === dialogSetDetails?.exerciseId)
                        ?.name || 'Unknown'}
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
  );
};

export default WorkoutForm;
