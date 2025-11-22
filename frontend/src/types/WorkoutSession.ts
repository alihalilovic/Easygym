import { User } from '@/types/User';
import { Workout } from '@/types/Workout';

export interface WorkoutSession {
  id: number;
  workoutId: number;
  workout?: Workout;
  traineeId: number;
  trainee?: User;
  startTime: string;
  endTime: string;
  perceivedDifficulty?: number;
  notes?: string;
}

export interface CreateWorkoutSessionRequest {
  workoutId: number;
  traineeId: number;
  startTime: string;
  endTime: string;
  perceivedDifficulty?: number;
  notes?: string;
}

export interface UpdateWorkoutSessionRequest {
  perceivedDifficulty?: number;
  notes?: string;
}

export interface WorkoutSessionQueryParams {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  workoutId?: number;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  minPerceivedDifficulty?: number;
  maxPerceivedDifficulty?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}
