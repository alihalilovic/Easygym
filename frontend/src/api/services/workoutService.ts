import { requests } from '@/api/api';
import {
  CreateWorkoutRequest,
  UpdateWorkoutRequest,
  Workout,
} from '@/types/Workout';

const workoutService = {
  getWorkouts: async () => {
    const workouts = await requests.get<Workout[]>(`/workout`);
    return workouts;
  },
  getWorkout: async (workoutId: number) => {
    const workout = await requests.get<Workout>(`/workout/${workoutId}`);
    return workout;
  },
  createWorkout: async (workout: CreateWorkoutRequest) => {
    const newWorkout = await requests.post<Workout>(`/workout`, workout);
    return newWorkout;
  },
  updateWorkout: async (workoutId: number, workout: UpdateWorkoutRequest) => {
    const updatedWorkout = await requests.put<Workout>(
      `/workout/${workoutId}`,
      workout,
    );
    return updatedWorkout;
  },
  deleteWorkout: async (workoutId: number) => {
    await requests.delete(`/workout/${workoutId}`);
  },
};

export default workoutService;
