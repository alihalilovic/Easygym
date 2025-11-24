import { requests } from '@/api/api';
import {
  CreateExerciseRequest,
  Exercise,
  UpdateExerciseRequest,
} from '@/types/Exercise';

const exerciseService = {
  getExercises: async () => {
    const exercises = await requests.get<Exercise[]>(`/exercise`);
    return exercises;
  },
  getExercise: async (exerciseId: number) => {
    const exercise = await requests.get<Exercise>(`/exercise/${exerciseId}`);
    return exercise;
  },
  createExercise: async (exercise: CreateExerciseRequest) => {
    const newExercise = await requests.post<Exercise>(`/exercise`, exercise);
    return newExercise;
  },
  updateExercise: async (
    exerciseId: number,
    exercise: UpdateExerciseRequest,
  ) => {
    const updatedExercise = await requests.put<Exercise>(
      `/exercise/${exerciseId}`,
      exercise,
    );
    return updatedExercise;
  },
  deleteExercise: async (exerciseId: number) => {
    await requests.delete(`/exercise/${exerciseId}`);
  },
};

export default exerciseService;
