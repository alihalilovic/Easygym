import { User } from '@/types/User';

export interface Set {
  id: number;
  name: string;
  description?: string;
  repetitions: number;
  weight?: number;
}

export interface Workout {
  id: number;
  name?: string;
  description?: string;
  traineeId: number;
  trainee?: User;
  trainerId?: number;
  trainer?: User;
  sets: Set[];
  restTimeSeconds: number;
  createdAt: string;
}

export interface WorkoutSession {
  id: number;
  workout: Workout;
  perceivedDifficulty?: number;
  notes?: string;
}

export interface CreateWorkoutRequest {
  name?: string;
  description?: string;
  traineeId: number;
  sets: Omit<Set, 'id'>[];
  restTimeSeconds?: number;
}

export interface UpdateWorkoutRequest {
  name?: string;
  description?: string;
  sets?: Set[] | Omit<Set, 'id'>[];
  restTimeSeconds?: number;
}