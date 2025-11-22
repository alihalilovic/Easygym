import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { routes } from '@/lib/constants';
import { Workout } from '@/types/Workout';
import { WorkoutSession as WorkoutSessionType } from '@/types/WorkoutSession';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  CheckCircle,
  DumbbellIcon,
  ListIcon,
  RepeatIcon,
  TimerIcon,
  CalendarClock,
  Clock,
  BarChart,
} from 'lucide-react';
import WorkoutCard from './WorkoutCard';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  FormField,
  FormLabel,
  FormControl,
  FormItem,
  Form,
  FormMessage,
} from '@/components/ui/form';
import FormWrapper from '@/components/ui/widgets/FormWrapper';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWorkouts } from '@/hooks/useWorkouts';
import { useWorkoutSession, useCreateWorkoutSession, useDeleteWorkoutSession } from '@/hooks/useWorkoutSessions';

const WorkoutSession = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const params = useParams();
  const viewMode = !!params.id;
  const sessionId = parseInt(params.id as string);

  const { data: workouts = [] } = useWorkouts(userId, !viewMode);
  const { data: fetchedWorkoutSession } = useWorkoutSession(userId, sessionId, viewMode);
  const createWorkoutSession = useCreateWorkoutSession();
  const deleteWorkoutSession = useDeleteWorkoutSession();

  const [workoutSession, setWorkoutSession] = useState<
    WorkoutSessionType | undefined
  >(undefined);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showingRest, setShowingRest] = useState(false);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);
  const [restTimeInterval, setRestTimeInterval] =
    useState<NodeJS.Timeout | null>(null);

  const WorkoutSessionFormSchema = z.object({
    perceivedDifficulty: z.coerce
      .number()
      .min(1, { message: 'Perceived difficulty must be at least 1' })
      .max(10, { message: 'Perceived difficulty must be at most 10' })
      .optional(),
    notes: z.string().optional(),
  });

  const workoutSessionForm = useForm<z.infer<typeof WorkoutSessionFormSchema>>({
    resolver: zodResolver(WorkoutSessionFormSchema),
    defaultValues: {
      perceivedDifficulty: 1,
      notes: '',
    },
  });

  useEffect(() => {
    if (viewMode && fetchedWorkoutSession) {
      setWorkoutSession(fetchedWorkoutSession);
    }
  }, [viewMode, fetchedWorkoutSession]);

  const handleStartSession = () => {
    if (!selectedWorkout) return;

    setSessionStarted(true);
    setSessionStartTime(new Date());

    toast.success(
      `Started workout: ${selectedWorkout.name || 'Unnamed Workout'}`,
    );
  };

  const clearRestTimeInterval = () => {
    if (restTimeInterval) {
      clearInterval(restTimeInterval);
      setRestTimeInterval(null);
    }
  };

  const handleNext = () => {
    clearRestTimeInterval();

    if (!selectedWorkout) return;

    // If showing rest, move to the next exercise
    if (showingRest) {
      setShowingRest(false);
      setCurrentExerciseIndex((prev) => prev + 1);
      return;
    }

    // If not the last exercise, show rest period
    if (currentExerciseIndex < selectedWorkout.sets.length - 1) {
      setShowingRest(true);
      setRestTimeRemaining(selectedWorkout.restTimeSeconds);

      const restInterval = setInterval(() => {
        setRestTimeRemaining((prev) => {
          if (prev <= 1) {
            clearRestTimeInterval();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      setRestTimeInterval(restInterval);
    }
  };

  const handleEndSession = async () => {
    if (!selectedWorkout || !sessionStartTime) return;

    await createWorkoutSession.mutateAsync({
      workoutId: selectedWorkout.id,
      traineeId: userId,
      startTime: sessionStartTime.toISOString(),
      endTime: new Date().toISOString(),
      notes: workoutSessionForm.getValues('notes'),
      perceivedDifficulty: workoutSessionForm.getValues('perceivedDifficulty'),
    });

    toast.success('Workout session completed!');
    navigate(routes.WorkoutSessions);
  };

  const currentProgress = useMemo(() => {
    if (!selectedWorkout) return 0;

    const totalSteps = selectedWorkout.sets.length * 2 - 1;
    const completedSteps = currentExerciseIndex * 2 + +showingRest;
    return (completedSteps / totalSteps) * 100;
  }, [selectedWorkout, currentExerciseIndex, showingRest]);

  const currentExercise = useMemo(() => {
    if (!selectedWorkout) return null;
    return selectedWorkout.sets[currentExerciseIndex];
  }, [selectedWorkout, currentExerciseIndex]);

  const isLastExercise = useMemo(() => {
    return (
      selectedWorkout &&
      currentExerciseIndex === selectedWorkout.sets.length - 1 &&
      !showingRest
    );
  }, [selectedWorkout, currentExerciseIndex, showingRest]);

  const handleEndWorkout = () => {
    workoutSessionForm.handleSubmit(handleEndSession)();
  };

  const handleDeleteSession = async () => {
    if (!viewMode) return;

    await deleteWorkoutSession.mutateAsync(Number(params.id));
    toast.success('Workout session deleted successfully');
    navigate(routes.WorkoutSessions);
  };

  return (
    <>
      {!sessionStarted && !viewMode && (
        <div className="workout-card-wrapper">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              viewOnly
              compact
              workout={workout}
              selected={selectedWorkout?.id === workout.id}
              onSelect={() => setSelectedWorkout(workout)}
            />
          ))}
        </div>
      )}

      {viewMode && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold">
              {workoutSession?.workout?.name + ' Session' || 'Unnamed Workout'}
            </h1>
            {workoutSession?.workout?.description && (
              <p className="text-muted-foreground">
                {workoutSession.workout.description}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div
              className={`bg-card rounded-lg shadow-sm border border-border p-4 ${!workoutSession?.notes ? 'w-full' : ''
                }`}
            >
              <h2 className="text-lg font-semibold mb-4">Session Details</h2>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <CalendarClock className="h-4 w-4" />
                  <span className="font-medium">Date: </span>
                  <span>
                    {new Date(
                      workoutSession?.startTime || '',
                    ).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2 items-center whitespace-nowrap">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Duration: </span>
                  <span>
                    {Math.round(
                      (new Date(workoutSession?.endTime || '').getTime() -
                        new Date(workoutSession?.startTime || '').getTime()) /
                      1000 /
                      60,
                    )}{' '}
                    minutes
                  </span>
                </div>
                {workoutSession?.perceivedDifficulty && (
                  <div className="flex gap-2 items-center">
                    <BarChart className="h-4 w-4" />
                    <span className="font-medium">Difficulty: </span>
                    <span>{workoutSession.perceivedDifficulty}/10</span>
                  </div>
                )}
              </div>
            </div>

            {workoutSession?.notes && (
              <div className="bg-card rounded-lg shadow-sm border border-border p-4 w-full">
                <h2 className="text-lg font-semibold mb-4">Notes</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {workoutSession.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-lg shadow-sm border border-border p-4">
              <h2 className="text-lg font-semibold mb-4">Workout Details</h2>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <ListIcon className="h-4 w-4" />
                  <span className="font-medium">Exercises: </span>
                  <span>{workoutSession?.workout?.sets?.length || 0}</span>
                </div>

                <div className="flex gap-2 items-center">
                  <TimerIcon className="h-4 w-4" />
                  <span className="font-medium">Rest time: </span>
                  <span>
                    {workoutSession?.workout?.restTimeSeconds || 0} seconds
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <h2 className="text-lg font-semibold mb-4">Exercises</h2>
            <div className="flex flex-col gap-4">
              {workoutSession?.workout?.sets.map((set) => (
                <div
                  key={set.id}
                  className="flex flex-col gap-2 p-3 rounded-md bg-muted/50"
                >
                  <div className="font-medium">{set.name}</div>
                  <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                    <div className="flex gap-2 items-center">
                      <RepeatIcon className="h-4 w-4" />
                      <span>{set.repetitions} repetitions</span>
                    </div>
                    {!!set.weight && set.weight > 0 && (
                      <div className="flex gap-2 items-center">
                        <DumbbellIcon className="h-4 w-4" />
                        <span>{set.weight} kg</span>
                      </div>
                    )}
                    {set.description && (
                      <p className="mt-1">{set.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Dialog>
            <Button className="self-start" variant="destructive" asChild>
              <DialogTrigger>Delete</DialogTrigger>
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete
                  your workout session and its related data from our servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="destructive" onClick={handleDeleteSession}>
                  Delete Workout
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {selectedWorkout?.id && !sessionStarted && (
        <div className="fixed bottom-8 right-8 bg-background">
          <Button onClick={handleStartSession}>Start Workout</Button>
        </div>
      )}

      {sessionStarted && (
        <div className="flex flex-col gap-4">
          <Progress value={currentProgress} className="w-full" />

          <div className="text-sm text-muted-foreground">
            Exercise {currentExerciseIndex + 1} of{' '}
            {selectedWorkout?.sets?.length || 0}
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-4">
            <div className="mb-4">
              <h3 className="text-xl font-semibold">
                {showingRest
                  ? 'Rest Time'
                  : currentExercise?.name || 'Exercise'}
              </h3>
            </div>
            <div className="mb-4">
              {showingRest ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="text-4xl font-bold mb-4">
                    {Math.floor(restTimeRemaining / 60)}:
                    {(restTimeRemaining % 60).toString().padStart(2, '0')}
                  </div>
                  <p>Take a moment to rest before the next exercise.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 items-center">
                    <RepeatIcon className="h-4 w-4" />
                    <span className="font-medium">Repetitions: </span>
                    <span>{currentExercise?.repetitions || 0}</span>
                  </div>

                  <div className="flex gap-2 items-center">
                    <DumbbellIcon className="h-4 w-4" />
                    <span className="font-medium">Weight: </span>
                    <span>
                      {currentExercise?.weight && currentExercise?.weight > 0
                        ? `${currentExercise.weight} kg`
                        : 'No added weight'}
                    </span>
                  </div>

                  {currentExercise?.description && (
                    <div className="text-sm text-muted-foreground">
                      {currentExercise.description}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-border pt-4">
              {!isLastExercise ? (
                <Button onClick={handleNext} className="ml-auto">
                  {showingRest ? 'Skip Rest' : 'Next'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleEndWorkout}
                  className="ml-auto"
                  variant="default"
                >
                  End Workout
                  <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {isLastExercise && (
            <Form {...workoutSessionForm}>
              <FormWrapper>
                <FormField
                  control={workoutSessionForm.control}
                  name="perceivedDifficulty"
                  render={({ field }) => (
                    <FormItem fullWidth>
                      <FormLabel>Perceived difficulty</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} max={10} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={workoutSessionForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem fullWidth>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter notes about this workout session..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormWrapper>
            </Form>
          )}
        </div>
      )}
    </>
  );
};

export default WorkoutSession;
