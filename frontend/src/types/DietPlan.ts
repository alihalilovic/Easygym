import { User } from '@/types/User';

export interface Meal {
  id: number;
  name: string;
  description?: string;
  mealType: string;
  notes?: string;
}

export interface DietPlanDay {
  id: number;
  dayOfWeek: number;
  meals: Meal[];
}

export interface DietPlanAssignment {
  id: number;
  dietPlanId: number;
  clientId: number;
  client?: User;
  isActive: boolean;
  assignedAt: string;
}

export interface DietPlan {
  id: number;
  name: string;
  trainerId: number;
  trainer?: User;
  days: DietPlanDay[];
  assignments: DietPlanAssignment[];
  createdAt: string;
}

export interface CreateDietPlanRequest {
  name: string;
  days: Omit<DietPlanDay, 'id' | 'meals'> & { meals: Omit<Meal, 'id'>[] }[];
}

export interface UpdateDietPlanRequest {
  name?: string;
  days?: (Omit<DietPlanDay, 'id' | 'meals'> & { meals: Omit<Meal, 'id'>[] })[];
}

export interface AssignDietPlanRequest {
  dietPlanId: number;
  clientIds: number[];
  isActive: boolean;
}
