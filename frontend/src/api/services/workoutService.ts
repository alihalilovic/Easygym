import { requests } from '@/api/api';
import {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Workout,
} from '@/types/Workout';

const workoutService = {
  getWorkoutsForTrainee: async (traineeId: number) => {
    const workouts = await requests.get<Workout[]>(
      `/workout/trainee/${traineeId}`,
    );
    return workouts;
  },
  getWorkoutsCreatedByTrainer: async (trainerId: number) => {
    const workouts = await requests.get<Workout[]>(
      `/workout/trainer/${trainerId}`,
    );
    return workouts;
  },
  getWorkoutForTrainee: async (traineeId: number, workoutId: number) => {
    const workout = await requests.get<Workout>(
      `/workout/trainee/${traineeId}/${workoutId}`,
    );
    return workout;
  },
  createWorkout: async (workout: CreateWorkoutRequest) => {
    const newWorkout = await requests.post<Workout>(`/workout`, workout);
    return newWorkout;
  },
  updateWorkout: async (
    traineeId: number,
    workoutId: number,
    workout: UpdateWorkoutRequest,
  ) => {
    const updatedWorkout = await requests.put<Workout>(
      `/workout/trainee/${traineeId}/${workoutId}`,
      workout,
    );
    return updatedWorkout;
  },
  deleteWorkout: async (traineeId: number, workoutId: number) => {
    await requests.delete(`/workout/trainee/${traineeId}/${workoutId}`);
  },
};

export default workoutService;
