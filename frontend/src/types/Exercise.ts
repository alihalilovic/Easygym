import { User } from '@/types/User';

export interface Exercise {
  id: number;
  name: string;
  description?: string;
  muscleGroup?: string;
  instructions?: string;
  createdById: number;
  createdBy?: User;
  createdAt: string;
  isPublic: boolean;
}

export interface CreateExerciseRequest {
  name: string;
  description?: string;
  muscleGroup?: string;
  instructions?: string;
}

export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  muscleGroup?: string;
  instructions?: string;
}
